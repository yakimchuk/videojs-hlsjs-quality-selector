import videojs from 'video.js';
import {version as VERSION} from '../package.json';
import ConcreteButton from './ConcreteButton';
import ConcreteMenuItem from './ConcreteMenuItem';
import ConcreteButtonHlsJs from './ConcreteButtonHlsJs';
import ConcreteMenuItemHlsJs from './ConcreteMenuItemHlsJs';
import Hls from "hls.js";

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * VideoJS HLS Quality Selector Plugin class.
 */
class HlsJSQualitySelectorPlugin {

  /**
   * Plugin Constructor.
   *
   * @param {Player} player - The videojs player instance.
   * @param {Object} options - The plugin options.
   */
  constructor(player, options) {
    this.player = player;
    this.config = options;

    // If there is quality levels plugin and the HLS tech exists
    // then continue.
    if (this.player.qualityLevels && (this.getHls() || this.getHlsJs())) {
      // Create the quality button.
      this.createQualityButton();
      this.bindPlayerEvents();
    }
  }

  /**
   * Returns HLS Plugin
   *
   * @return {*} - videojs-hls-contrib plugin.
   */
  getHls() {
    return this.player.tech({ IWillNotUseThisInPlugins: true }).hls;
  }

  /**
   * Returns HLS Plugin
   *
   * @return {*} - videojs-hls-contrib plugin.
   */
  getHlsJs() {
    return this.player.tech({ IWillUseThisInPlugin: true }).sourceHandler_.hls;
  }

  /**
   * Binds listener for quality level changes.
   */
  bindPlayerEvents() {
    this.player.qualityLevels().on('addqualitylevel', this.onAddQualityLevel.bind(this));

    if(this.getHlsJs()) {
      this.player.tech_.on(Hls.Events.MANIFEST_LOADED, this.fillQualityLevels.bind(this))
    }
  }

  fillQualityLevels() {
    const hlsjs = this.getHlsJs();

    const player = this.player;
    const levels = hlsjs.levels || [];
    const levelItems = [];

    for (let i = 0; i < levels.length; ++i) {
      if (!levelItems.filter(_existingItem => {
        return _existingItem && _existingItem.item.value === levels[i].height;
      }).length) {
        const levelItem = this.getQualityMenuItem.call(this, {
          label: levels[i].height + 'p',
          value: levels[i].height
        });

        levelItems.push(levelItem);
      }
    }

    levelItems.sort((current, next) => {
      if ((typeof current !== 'object') || (typeof next !== 'object')) {
        return -1;
      }
      if (current.item.value < next.item.value) {
        return -1;
      }
      if (current.item.value > next.item.value) {
        return 1;
      }
      return 0;
    });

    levelItems.push(this.getQualityMenuItem.call(this, {
      label: player.localize('Auto'),
      value: 'auto',
      selected: true
    }));

    if (this._qualityButton) {
      this._qualityButton.createItems = function() {
        return levelItems;
      };
      this._qualityButton.update();
    }
  }

  /**
   * Adds the quality menu button to the player control bar.
   */
  createQualityButton() {

    const player = this.player;

    if(this.getHls()) {
      this._qualityButton = new ConcreteButton(player);
    } else {
      this._qualityButton = new ConcreteButtonHlsJs(player);
    }

    const placementIndex = player.controlBar.children().length - 2;
    const concreteButtonInstance = player.controlBar.addChild(this._qualityButton,
      {componentClass: 'qualitySelector'},
      placementIndex);

    concreteButtonInstance.addClass('vjs-quality-selector');
    if (!this.config.displayCurrentQuality) {
      const icon = ` ${this.config.vjsIconClass || 'vjs-icon-hd'}`;

      concreteButtonInstance
        .menuButton_.$('.vjs-icon-placeholder').className += icon;
    } else {
      this.setButtonInnerText('auto');
    }

    concreteButtonInstance.removeClass('vjs-hidden');
  }

  /**
   * Set inner button text.
   *
   * @param {string} text - the text to display in the button.
   */
  setButtonInnerText(text) {
    this._qualityButton
      .menuButton_.$('.vjs-icon-placeholder').innerHTML = text;
  }

  /**
   * Builds individual quality menu items.
   *
   * @param {Object} item - Individual quality menu item.
   * @return {ConcreteMenuItem | ConcreteMenuItemHlsJs} - Menu item
   */
  getQualityMenuItem(item) {
    const player = this.player;
    if(this.getHls()) {
      return new ConcreteMenuItem(player, item, this._qualityButton, this);
    } else {
      return new ConcreteMenuItemHlsJs(player, item, this._qualityButton, this);
    }

  }

  /**
   * Executed when a quality level is added from HLS playlist.
   */
  onAddQualityLevel() {

    const player = this.player;
    const qualityList = player.qualityLevels();
    const levels = qualityList.levels_ || [];
    const currentLevel = hlsjs.currentLevel || 0;
    const levelItems = [];

    for (let i = 0; i < levels.length; ++i) {
      if (!levelItems.filter(_existingItem => {
        return _existingItem.item && _existingItem.item.value === levels[i].height;
      }).length) {
        const levelItem = this.getQualityMenuItem.call(this, {
          label: levels[i].height + 'p',
          value: levels[i].height,
          selected: currentLevel === i,
        });

        levelItems.push(levelItem);
      }
    }

    levelItems.sort((current, next) => {
      if ((typeof current !== 'object') || (typeof next !== 'object')) {
        return -1;
      }
      if (current.item.value < next.item.value) {
        return -1;
      }
      if (current.item.value > next.item.value) {
        return 1;
      }
      return 0;
    });

    levelItems.push(this.getQualityMenuItem.call(this, {
      label: player.localize('Auto'),
      value: 'auto',
      selected: true
    }));

    if (this._qualityButton) {
      this._qualityButton.createItems = function() {
        return levelItems;
      };
      this._qualityButton.update();
    }

  }

  /**
   * Sets quality (based on media height)
   *
   * @param {number} height - A number representing HLS playlist.
   */
  setQuality(height) {
    if(this.getHlsJs()) {
      return this.setQualityHlsJs(height);
    }

    const qualityList = this.player.qualityLevels();

    for (let i = 0; i < qualityList.length; ++i) {
      const quality = qualityList[i];

      quality.enabled = (quality.height === height || height === 'auto');
    }

    this._qualityButton.unpressButton();
  }

  setQualityHlsJs(height) {
    const hlsjs = this.getHlsJs();
    const levels = hlsjs.levels || [];

    console.log('setQualityHlsJs', height, levels);

    if(height === 'auto') {
      hlsjs.currentLevel = -1;
      this.setButtonInnerText('auto');
    } else {
      for(let i = 0; i < levels.length; ++i) {
        const level = levels[i];
        if(level.height === height) {
          hlsjs.currentLevel = i;
          this.setButtonInnerText(`${height}p`);
          break;
        }
      }
    }
  }

}

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-hls-quality-selector');
  player.hlsJsQualitySelector = new HlsJSQualitySelectorPlugin(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function hlsQualitySelector
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const hlsJsQualitySelector = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('hlsJsQualitySelector', hlsJsQualitySelector);

// Include the version number.
hlsJsQualitySelector.VERSION = VERSION;

export default hlsJsQualitySelector;
