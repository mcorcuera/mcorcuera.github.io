/**
 * @namespace
 */ 
var svWizard = svWizard || {
  /**
   * @memberOf svWizard
   * @namespace
   */ 
  services: {},
  /**
   * @memberOf svWizard
   * @namespace
   */ 
  controllers: {},
  /**
   * @memberOf svWizard
   * @namespace
   */ 
  models: {},
  /**
   * @memberOf svWizard
   * @namespace
   */ 
  directives: {},
  
  /**
   * Google Maps APIs domain
   * @constant
   * @memberOf svWizard
   * @inner
   * @type {string}
   * @default
   */
  DOMAIN: 'https://maps.googleapis.com',
  
  /**
   * Google Maps Street View API base URL
   * @constant
   * @memberOf svWizard
   * @inner
   * @type {string}
   * @default
   */
  BASE_URL: '/maps/api/streetview'
};

var svWizardApp = angular.module('svWizardApp', ['ngDialog',
  'ng-polymer-elements', 'LocalStorageModule']);

svWizardApp.config(['localStorageServiceProvider', 'MenuProvider',
  function (localStorageServiceProvider, MenuProvider) {
    localStorageServiceProvider.setPrefix('svwizard');
    MenuProvider.setMenuElement(angular.element('#drawer').get(0));
  }
]);

var svWizard = svWizard || svWizard;

/**
 * Street View API request parameters and properties used to support storing the
 * requests in local storage. For more information on the Street View request
 * parameters, visit the documentation <a href="https://goo.gl/hCvvt">here</a>.
 * @typedef {Object}
 * @property {string} id unique id of the request
 * @property {string} name request's name
 * @property {svWizard.models.Size} size size of the Street View
 * @property {svWizard.models.LatLng} location location of the Street View
 * @property {number} heading heading of the Street View
 * @property {number} fov field of view of the Street View
 * @property {number} pitch pitch of the Street View
 * @property {svWizard.models.AuthenticationMode} authenticationMode the way
 *  the request is going to be authenticated
 * @property {number} timestamp last request modification's timestamp
 */
svWizard.models.Request;

/**
 * Authentication Modes allowed by the Street View API
 * @readonly
 * @enum {string}
 */ 
svWizard.models.AuthenticationMode = {
  /**
   * no authentication
   */
  NONE: 'none',
  /**
   * authentication via API key
   */ 
  API_KEY: 'api_key',
  /**
   * authentication via client id and signature generated with a crypto key
   */
  CLIENT_AND_CRYPTO: 'client_and_crypto'
};

/**
 * Loocation in latitude and longitude coordinates
 * @typedef {Object}
 * @property {number} lat latitude in degrees
 * @property {number} lon longitude in degrees
 */
svWizard.models.LatLng;

/**
 * Width and height size
 * @typedef {Object}
 * @property {number} width width value in pixels
 * @property {number} height height value in pixels
 */
svWizard.models.Size;


var svWizard = svWizard || {};

svWizard.services = svWizard.services || {};

/**
 * This namespace contains utility functions to work with UI, numbers
 * and signing algorithms.
 * <br/>
 * It is included in the angular app module as <b>Utils</b> factory and needs 
 * no configuration
 * @namespace
*/
svWizard.services.utils = (function(){
  
  /** @lends svWizard.services.utils */
  var utils = {
    /**
     * Utility functions to format and transform numbers
     * @namespace
     */
    numbers: {},
    /**
     * Utility functions to sign strings
     * @namespace
     */
    signing: {},
    /**
     * Utility functions to use for UI operations
     * @namespace
     */
    ui: {},
    
    /**
     * Utility functions to generate the request URL out of the
     * request parameters and configuration
     * @namespace
     */
    generator: {}
  };
  
  /**
   * Rounds <tt>num</tt> to have a given number of decimal places
   * @param {number} num number to round
   * @param {number} places number of decimal places to round to
   * @returns {number}
   * @memberOf svWizard.services.utils.numbers
   */
   
  utils.numbers.decimalPlaces = function(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round( num * multiplier) / multiplier;
  };
  
  /**
   * Makes the number to be always between 0 and <tt>max</tt> by wrapping it 
   * to the other side. If a number is goes over the maximum value, it is
   * wrapped to 0. If it goes under 0, it is wrapped to the maximum.
   * 
   * @param {number} num number to wrap
   * @param {number} max maximum value allowed
   * @returns {number}
   * @memberOf svWizard.services.utils.numbers
   */ 
  utils.numbers.wrap = function(num,max) {
    if( num >= 0) {
      return num % max;
    }else if( num < 0) {
      return max + num%max;
    }
  };
  
  /**
   * Converts the FoV (Field of View) value of a Google Maps Street View API
   * request to a zoom level required by the Street View in the Javascript API,
   * as per the documentation here: https://goo.gl/hCvvt
   * @param {number} fov field of view value in degrees
   * @returns {number} corresponding zoom value
   * @memberOf svWizard.services.utils.numbers
   */
  utils.numbers.fov2zoom = function(fov) {
    // fov = 180 / (2 ^ zoom)
    // zoom = (log(180) - log(fov))/log(2)
    return Math.log(180/fov) / Math.log(2);
  };
  /**
   * Converts the zoom level required by the Street View in the Javascript API
   * to the FoV (Field of View) value of a Google Maps Street View API
   * request to as per the documentation here: https://goo.gl/hCvvt
   * @param {number} zoom
   * @returns {number} corresponding field of view value in degrees
   * @memberOf svWizard.services.utils.numbers
   */   
  utils.numbers.zoom2fov = function(zoom) {
    return 180 / (Math.pow(2,zoom));
  }
  
  /**
   * Calculates the available inner size of the element in pixels, by 
   * substracting the padding values to the dimensions (width and height)
   * @param {Element} element HTML element to obtain the inner size from
   * @param {CSSStyleDeclaration} cs the computed style of the element
   * @returns {number} the inner size of the element in pixels
   * @memberOf svWizard.services.utils.ui
   */
  utils.ui.getInnerSize = function(el, cs) {
    var px2int = utils.ui.px2int;
    var tWidth = px2int(cs.getPropertyValue('width'));
    var tHeight = px2int(cs.getPropertyValue('height'));
    var pRigth = px2int(cs.getPropertyValue('padding-right'));
    var pLeft = px2int(cs.getPropertyValue('padding-left'));
    var pTop = px2int(cs.getPropertyValue('padding-top'));
    var pBottom = px2int(cs.getPropertyValue('padding-bottom'));
  
    return {
      width: tWidth - pRigth - pLeft,
      height: tHeight - pTop - pBottom
    };
  }
  
  /**
   * Helper function to convert a CSS string value of pixels, such as 
   * <tt>'12px'</tt> to its number value.
   * @param {String} px CSS string value of a pixel measure
   * @returns {number} pixel value
   * @memberOf svWizard.services.utils.ui
   */
  utils.ui.px2int = function(px) {
    return parseInt(px.replace('px', ''));
  }
  
  /**
   * Generates a signature for a string with a crypto key using the 
   * HMAC-SHA1 algorithm (https://goo.gl/wj9NNv)
   * @param {String} text to generate the signature from
   * @param {String} cryptoKey Base64 WebSafe encoded HMAC secret used to generate
   *  the signature
   * @returns {string} generated Base64 WebSafe encoded signature
   * @memberOf svWizard.services.utils.signing
   */
  utils.signing.signature = function(text, cryptoKey) {
    var unescapedCryptoKey = utils.signing.unescapeWebSafeBase64(cryptoKey);
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(unescapedCryptoKey, 'B64');
    shaObj.update(text);
    var unescapedSignature = shaObj.getHMAC('B64');
    return utils.signing.escapeWebSafeBase64(unescapedSignature);
  }
   /**
   * Removes the safe characters used in the modified Base64 string input and
   * returns a string with valid Base64 characters. It replaces <tt>-</tt> by
   * <tt>+</tt> and <tt>_</tt> byt <tt>/</tt>
   * @param {String} escaped Websafe escaped Base64
   * @returns {string} regular Base64
   * @memberOf svWizard.services.utils.signing
   */    
  utils.signing.unescapeWebSafeBase64 = function(escaped) {
    return escaped.replace(/-/g, '+').replace(/_/g, '/');
  }
  /**
   * Removes the web unsafe characters used a Base64 string input and
   * returns a Base64 string with web safe characters. It replaces <tt>+</tt> by
   * <tt>-</tt> and <tt>/</tt> byt <tt>_</tt>
   * @param {string} unescaped regular Base64
   * @returns {string} websafe escaped Base64
   * @memberOf svWizard.services.utils.signing
   */      
  utils.signing.escapeWebSafeBase64 = function(unescaped) {
    return unescaped.replace(/\+/g, '-').replace(/\//g, '_');
  }

  /**
   * Generates a request URL for a given request parameters and authentication
   * credentials
   * @param {svWizard.models.Request} request contains the parameters to build
   *  the URL
   * @param {svWizard.services.Settings} settings application settings to get 
   *  the configuration credentials from
   * @returns {string}
   * @memberOf svWizard.services.utils.generator
   */ 
  utils.generator.generate = function(request, settings) {
    var parameters = {
      location: request.location.lat + ',' + request.location.lng,
      heading: request.heading,
      pitch: request.pitch,
      fov: request.fov,
      size: request.size.width + 'x' + request.size.height
    };
    var relativeUrl = utils.generator.addParameters(svWizard.BASE_URL, parameters);
        
    if(request.authenticationMode == svWizard.models.AuthenticationMode.NONE) {
      return svWizard.DOMAIN + relativeUrl;
    }else if(request.authenticationMode == svWizard.models.AuthenticationMode.API_KEY){
      return svWizard.DOMAIN + relativeUrl + '&key=' + settings.apiKey;
    }else{
      var urlToSign = relativeUrl + '&client=' + settings.clientId;
      var signature = utils.signing.signature(urlToSign, 
        settings.cryptoKey);
      return svWizard.DOMAIN + urlToSign + '&signature=' + signature;
    }
  };
  
  /**
   * Appends query parameters to a given URL path
   * @param {string} path URL path to add the parameters to
   * @param {Object} parameters key-value pairs where the key is the parameter
   *  name and the value its content
   * @returns {string} the URL with the query parameters
   * @memberOf svWizard.services.utils.generator
   */
  utils.generator.addParameters = function (path,parameters) {
    var url = path;
    var paramStr = '';
    for (var key in parameters) {
      if(parameters.hasOwnProperty(key)) {
        paramStr += key + '=' + parameters[key];
        paramStr += '&';
      }
    }
    if(paramStr.length > 0) {
      paramStr = paramStr.slice(0, paramStr.length - 1);
      url += '?' + paramStr;
    }
    return url;
  }  
  return utils;
})();

angular.module('svWizardApp').factory('Utils', function() {
  return svWizard.services.utils;
});

var svWizard = svWizard || {};
svWizard.services = svWizard.services || {};

svWizard.services.Settings = (function(){
  /**
   * The Settings service is used to store and retrieve the configuration of the
   * application using the browser's local storage. Its properties are 
   * automatically saved from local storage upon change.
   * <br/>
   * It is included in the angular app module as <b>Settings</b> service and needs 
   * no configuration
   * @constructor
   * @param {localStorageService} localStorageService <b>Injected</b>
   * @memberOf svWizard.services
   */  
  var Settings = function(localStorageService) {
    
    var API_KEY = 'apikey';
    var CRYPTO_KEY = 'cryptokey';
    var CLIENT_ID = 'clientid';
    
    var apiKey_ = '';
    var cryptoKey_ = '';
    var clientId_ = '';
    
    loadSetings_();
    
    /**
     * The API key used to authenticate the requests
     * @member {string} apiKey
     * @memberOf svWizard.services.Settings
     */
    Object.defineProperty(this, 'apiKey', {
      get: function() {return apiKey_;},
      set: function(apiKey) {
        apiKey_ = apiKey;
        localStorageService.set(API_KEY, apiKey_);
      }
    });
    
    /**
     * The client id used to authenticate the requests of Premium customers.
     * @member {string} clientId
     * @memberOf svWizard.services.Settings
     */
    Object.defineProperty(this, 'clientId', {
      get: function() {return clientId_;},
      set: function(clientId) {
        clientId_ = clientId;
        localStorageService.set(CLIENT_ID, clientId_);
      }
    });
    /**
     * The crypto key to sign the requests of Premium customers.
     * @member {string} cryptoKey
     * @memberOf svWizard.services.Settings
     */
    Object.defineProperty(this, 'cryptoKey', {
      get: function() {return cryptoKey_;},
      set: function(cryptoKey) {
        cryptoKey_ = cryptoKey;
        localStorageService.set(CRYPTO_KEY, cryptoKey_);
      }
    });
    
    /* Loads settings from local storage */
    function loadSetings_() {
      apiKey_ = localStorageService.get(API_KEY);
      cryptoKey_ = localStorageService.get(CRYPTO_KEY);
      clientId_ = localStorageService.get(CLIENT_ID);
    }
  };
  
  return Settings;
})();

angular.module('svWizardApp').service('Settings', ['localStorageService', 
  svWizard.services.Settings
]);

var svWizard = svWizard || {};

svWizard.services = svWizard.services || svWizard;

svWizard.services.RequestProvider = (function(){
  
  /**
   * RequestProvider handles the creation, retrieval, update and deletion of
   * requests into the browser's local storage.
   * * <br/><br/>
   * It is included in the angular app module as <b>RequestProvider</b> service
   * and needs no configuration
   * @constructor
   * @param {localStorageService} localStorageService <b>Injected</b>
   * @memberOf svWizard.services
   */
  var RequestProvider = function(localStorageService) {
    var REQUESTS = 'requests';

    var requests_ = {};
    var requestsArray_ = []
    // Gets the requests from local storage
    init_();
    
    /**
     * The list of saved requests. It gets updated upong any change.
     * @readonly
     * @member {Array.<svWizard.models.Request>} requests
     * @memberOf svWizard.services.RequestProvider.prototype
     */
    Object.defineProperty(this, 'requests', {
      get: function(){return requestsArray_}
    });

    /**
     * It saves a new request into the requests collection and stores it in
     * local storage. It will also update the requests array. Note that the
     * request must have a name and it must be unique.
     * @method
     * @param {svWizard.models.Request} request the request to save
     * @returns {svWizard.models.Request} the created request
     */
    this.createRequest = function(request) {
      if(request.name === undefined || request.name === null || 
        request.name.length === 0) {
        throw 'Request must have a name';
      }
      
      if(this.getRequestWithName(request.name) !== null) {
        throw 'Name should be unique';
      }
      var id = Math.random().toString(36).substr(2, 9)
      request.id = id;
      request.timestamp = Date.now() + '';
      requests_[id] = request;
      saveRequests_();
      updateArray_();
      return request;
    };
    
    /**
     * It updates an already existing request in the requests collection and 
     * stores it in local storage. It will also update the requests array.
     * Note that the request must have been saved before and, in case it has a 
     * new name, it must be unique.
     * @method
     * @param {svWizard.models.Request} request the request to save
     * @returns {svWizard.models.Request} the updated request
     */
    this.updateRequest = function(id, newReq) {
      if(newReq.name === undefined || newReq.name === null || 
        newReq.name.length === 0) {
        throw 'Request must have a name';
      }
      var oldReq = requests_[id];
      
      if(oldReq === undefined || oldReq === null) {
        throw 'Request does not exist';
      }
      newReq.id = id;
      newReq.timestamp = Date.now() + '';
      requests_[id] = newReq;
      saveRequests_();
      updateArray_();
      return newReq;
    };
    
    /**
     * Returns the request with the name provided if it exists in the requests
     * collection. It will return <tt>null</tt> otherwise.
     * @method
     * @params {string} name the name of the request to search
     * @return {svWizard.models.Request}
     */
    this.getRequestWithName = function(name) {
      var request = null;
      if(name !== null && name !== undefined && name != '') {
        for(var id in requests_) {
          if(requests_.hasOwnProperty(id)) {
            if(requests_[id].name === name) {
              request = requests_[id];
              break;
            }
          }
        }  
      }
      return request;
    }
    
    /**
     * Deletes the request with the given id and updates the collection in local
     * storage.
     * @method
     * @param {string} id
     */
    this.deleteRequest = function(id) {
      delete requests_[id];
      saveRequests_();
      updateArray_();
    }
    
    //Private
    
    /*Loads the requests from locastorage*/
    function init_() {
      var rawRequests = localStorageService.get(REQUESTS);
      if(angular.isDefined(rawRequests) && rawRequests !== null
        && rawRequests.length > 0) {
        requests_ = angular.fromJson(rawRequests);
      }else{
        requests_ = {};
      }
      updateArray_();
    }
    /* Pushes the collection items into an array instead of into an object so it
    is easier to use in a view */
    function updateArray_() {
      requestsArray_ = [];
      for(var key in requests_) {
        requestsArray_.push(requests_[key]);
      }
    }
    /* Saves the requests collection into local storage */
    function saveRequests_() {
      var requestsJson = angular.toJson(requests_);
      localStorageService.set(REQUESTS, requestsJson);
    } 
  }
  return RequestProvider;
})();

angular.module('svWizardApp').service('RequestProvider', ['localStorageService',
  svWizard.services.RequestProvider
]);

var svWizard = svWizard || {};
var angular = angular || {};

svWizard.services = svWizard.services || {};

svWizard.services.State = (function(){
  
  /**
   * The State service is used to store and retrieve the status of the
   * application using the browser's local storage.
   * <br/><br/>
   * It is included in the angular app module as <b>State</b> service and needs 
   * no configuration
   * @constructor
   * @param {localStorageService} localStorageService <b>Injected</b>
   * @memberOf svWizard.services
   */  
  var State = function(localStorageService) {
    
    var CURRENT = 'current';
    var current_ = {};
    
    //Get value from local storage
    init_();

    /**
     * Current request being edited on the app. When the request is changed
     * by setting its value to a new one, it will be automatically updated in
     * local storage. Note that it won't react when the properties of the
     * object change.
     * @member {Request} current
     * @memberOf svWizard.services.State.prototype
     */
    Object.defineProperty(this, 'current', {
      get: function(){
        if(angular.isUndefined(current_.size) ||
        angular.isUndefined(current_.location) ||
        angular.isUndefined(current_.heading) ||
        angular.isUndefined(current_.fov) ||
        angular.isUndefined(current_.pitch)) {
          current_ = angular.copy(State.DEFAULT_REQUEST);
        }
        return current_;
      },
      set: function(request){
        current_ = request;
        this.saveCurrentRequest();
      }
    });
    
    /**
     * Saves <tt>current</tt> request in local storage. Should be call everytime
     * its properties change.
     * @method saveCurrentRequest
     * @memberOf svWizard.services.State.prototype
     */
    this.saveCurrentRequest = function(){
      var currentJson = angular.toJson(current_);
      localStorageService.set(CURRENT, currentJson);
    }
    
    //Private
    
    /* It gets the current resquest data from local storage */
    function init_() {
      var rawCurrent = localStorageService.get(CURRENT);
      if(angular.isDefined(rawCurrent) && rawCurrent !== null &&
        rawCurrent.length > 0) {
        current_ = angular.fromJson(rawCurrent);
      }else{
        current_ = {};
      }
    }

  }
  
  /**
   * @constant
   * @type {svWizard.models.Request}
   */
  State.DEFAULT_REQUEST =  {
    timestamp: null,
    name: null,
    location: {lat: 37.3863, lng: -5.99205},
    size: {
      width: 640,
      height: 640
    },
    heading: 254.5,
    fov: 71.6,
    pitch: 30.8,
    authenticationMode: svWizard.models.AuthenticationMode.NONE
  };
  
  return State;
})();

angular.module('svWizardApp').service('State', ['localStorageService',
  svWizard.services.State
]);

var svWizard = svWizard || {};
svWizard.services = svWizard.services || {};

svWizard.services.Menu = (function(){
  /**
   * The Menu service is used to control the opening and closing of the menu
   * paer-drawer. It has to be configured using the <tt>Menu.Provider</tt> named 
   * <tt>MenuProvider</tt> in angular.
   * @constructor
   * @param {Element} menuElement the paper-drawer element which contains the menu
   * @memberOf svWizard.services
   */
  var Menu = function(menuElement) {
    this.element = menuElement;
  }
  /**
   * Opens the menu
   * @method
   */
  Menu.prototype.open = function(){
    this.element.openDrawer();
  }
  /**
   * Closes the menu
   * @method
   */ 
  Menu.prototype.close = function(){
    this.element.closeDrawer();
  }
  /**
   * Provider to configure the <tt>Menu</tt> service by providin the HTML element
   * where the paper-drawer element is. It can be inserted in 
   * the angular app configuration method with the name 'MenuProvider'.
   * @class
   */
  Menu.Provider = function() {
  
    var menuElement_ = null;
    /**
     * The element provided is used to configure the Menu service to work upon it
     * @method 
     * @param {Element} element the paper-drawer element which contains the menu
     */
    this.setMenuElement = function(element) {
      menuElement_ = element;
    }
    /**
     * Gets an already configured instance of the Menu service
     * @method
     * @returns {svWizard.services.Menu} the configured Menu service
     */
    this.$get = function() {
      return new svWizard.services.Menu(menuElement_);
    }
  };
  return Menu;
})();

angular.module('svWizardApp').provider('Menu', 
  svWizard.services.Menu.Provider);

var svWizard = svWizard || {};
svWizard.controllers = svWizard.controllers || {};

svWizard.controllers.MainCtrl = (function(){
  /**
   * MainCtrl controls the main view of the application, where the user can edit
   * the different parameters using the form and also using the Street View 
   * panorama viewer. The parameters modified by any of these ways will be 
   * reflected in the other, as they both modify the <tt>current</tt> request.
   * When this parameters are modified, the <tt>State</tt> service is used to
   * save the changes into local storage.
   * <br/><br/>
   * This controller also handles generating the request URL and displaying it 
   * to the user in a dialog, saving the requests and creating new ones.
   * @constructor
   * @param {Scope} scope <b>Injected</b>
   * @param {svWizard.services.State} state  <b>Injected</b>
   * @param {svWizard.services.Settings} settings  <b>Injected</b>
   * @param {svWizard.services.Menu} menu  <b>Injected</b>
   * @param {svWizard.services.Utils} utils  <b>Injected</b>
   * @param {ngDialog} ngDialog  <b>Injected</b>
   * @memberOf svWizard.controllers
   */
  var MainCtrl = function(scope, state, settings, menu, utils, ngDialog) {
      
    /**
     * The application's state
     * @type {svWizard.services.State}
     */
    this.state = state;
    
    /**
     * The application's settings
     * @type {svWizard.services.Settings}
     */
    this.settings = settings;
    
    /**
     * The Menu service used to open and close the side menu
     * @type {svWizard.services.Menu}
     */
    this.menu = menu;
    
    /**
     * @type {svWizard.models.AuthenticationMode}
     */
    this.AuthenticationMode = svWizard.models.AuthenticationMode;
    
    /**
     * List of messages needed in the view
     * @type {Object}
     */
    this.messages = {
      /**
       * Message to display in the new-request confirmation dialog
       * @type {string}
       * @default
       */
      confirmNew: 'Do you really want to create a new request? All unsaved ' +
          'changes will be discarded.'
    };
    
    /**
     * Flag that indicates whether the user is missing to provide the needed
     * authentication credentials for the selected authentication method. It is 
     * used in the view to display an error message.
     * @type {boolean}
     */
    this.authenticationMissing = false;
    
    /**
     * The request generator
     * @private
     * @type {svWizard.services.utils.generator}
     **/
    this.generator_ = utils.generator;
    
    /**
     * ngDialog service to create pop-up dialogs
     * @private
     * @type {ngDialog}
     **/
    this.ngDialog_ = ngDialog;
    
    var self = this;
    
    // If any of the properties of the current request changes, onRequestChange
    // is called, which saves the changes into local storage and validates the
    // authentication
    scope.$watch( function() {
      return self.state.current;
    }, function(){
      self.onRequestChange();
    }, true);
    
    // If the authentication settings change, the authentication is checked 
    // to check if there is anything missing and display a message accordingly
    scope.$watch( function() {
      return {
        apiKey: self.settings.apiKey,
        cryptoKey: self.settings.cryptoKey,
        clientId: self.settings.clientId
      };
    }, function(){
      self.validateAuth();
    }, true);
  }
  
  /**
   * It updates the current request location to the one of the provided address.
   * <br/><br/>
   * This function has to be used within the autocomplete directive, so it is
   * called when the user selects and address.
   * @param {google.maps.places.PlaceResult} address the selected address on 
   *  the autocomplete input
   * @method
   */ 
  MainCtrl.prototype.addressSelected = function(address) {
    if( address !== undefined && address !== null) {
      var location = address.geometry.location;
      this.state.current.location.lat = location.lat();
      this.state.current.location.lng = location.lng();
    }
  };
  
  /**
   * Generates a Street View request URL based on the current request parameters
   * and opens the GeneratedDialog to display it
   * @method
   */
  MainCtrl.prototype.generate = function() {
    var url = this.generator_.generate(this.state.current, this.settings);
    this.ngDialog_.open({
      template: 'templates/generated.html',
      className: 'ngdialog-theme-default ngdialog-theme-custom',
      controller: 'GeneratedUrlCtrl',
      controllerAs: 'generated',
      data: {
        url: url
      }
    });
  };
  
  
  /**
   * Checks whether the current request is configured to use for Work or
   * Premium Plan, which means using client id and crypto key to authenticate it
   * @returns {boolean}
   * @method
   */
  MainCtrl.prototype.isForWork = function() {
    return this.state.current.authenticationMode 
      === this.AuthenticationMode.CLIENT_AND_CRYPTO;
  }
  
  /**
   * Checks whether the current request is configured to use the free version, 
   * which means not using any authentication method
   * @returns {boolean}
   * @method
   */
  MainCtrl.prototype.isFree = function() {
    return this.state.current.authenticationMode 
      === this.AuthenticationMode.NONE;
  }
  
  /**
   * Checks whether the current request is configured to use an API key to
   * authenticate the request
   * @returns {boolean}
   * @method
   */
  MainCtrl.prototype.isApiKey = function() {
    return this.state.current.authenticationMode 
      === this.AuthenticationMode.API_KEY;
  }
  
  /**
   * Checks if the user has provided the needed authentication credentials in
   * the settings page for the selected authentication method, and updates the
   * <tt>authenticationMissing</tt> flag accodingly. Should be called everytime
   * the current request authentication method or the authentication settings 
   * change.
   * @method
   */
  MainCtrl.prototype.validateAuth = function() {
    var mode = this.state.current.authenticationMode;
    this.authenticationMissing = true;
    
    if(mode === this.AuthenticationMode.NONE){
      this.authenticationMissing = false;
    }else if(mode === this.AuthenticationMode.API_KEY && this.settings.apiKey
      && this.settings.apiKey.length > 0) {
      this.authenticationMissing = false;
    }else if(mode === this.AuthenticationMode.CLIENT_AND_CRYPTO
      && this.settings.cryptoKey && this.settings.cryptoKey.length > 0
      && this.settings.clientId && this.settings.clientId.length > 0) {
      this.authenticationMissing = false;    
    } 
  };
  
  /**
   * Saves the current request in localstorage using the <tt>State</tt> service
   * and validates the authentication using <tt>validateAuth</tt>.
   * <br/><br/>
   * It should be called everytime some parameter on the current request
   * chages.
   * @method
   */
  MainCtrl.prototype.onRequestChange = function(){
    this.validateAuth();
    this.state.saveCurrentRequest();
  }
  
  /**
   * Opens the save dialog so the user can change the name of the request or
   * save it as a new request. It will update the current request with the saved
   * one, which will contain a new id if it's been newly created and a new 
   * timestamp.
   * @method
   */
  MainCtrl.prototype.save = function() {
    var self = this;
    this.ngDialog_.openConfirm({
      template: 'templates/save.html',
      className: 'ngdialog-theme-default ngdialog-theme-custom',
      controller: 'SaveCtrl',
      controllerAs: 'save',
      data: {
        request: this.state.current
      }
    }).then( function(saved) {
      self.state.current = angular.copy(saved);
    });
  }
  
  /**
   * Creates a new request. Note that in the View, this function is called using
   * the <tt>confirmAction</tt> directive, which means that it won't be executed
   * when the user clicks the new button, but rather when the users confirms
   * the action in the dialog that will be prompted. The parameters of the 
   * new request will remain the same as they were, but it will have no id nor 
   * name.
   * @method
   */
  MainCtrl.prototype.newRequest = function() {
    this.state.current.id = null;
    this.state.current.name  = '';
  };
  return MainCtrl;
})();

angular.module('svWizardApp').controller( 'MainCtrl', ['$scope', 'State', 
'Settings', 'Menu', 'Utils', 'ngDialog',
  svWizard.controllers.MainCtrl]);

var svWizard = svWizard || {};
svWizard.controllers = svWizard.controllers || {};

svWizard.controllers.GeneratedUrlCtrl = (function(){
  
  /**
   * GeneratedUrlCtrl controls a simple dialog to show and open the generated
   * StreetView request. Note that this controller can only be used in a dialog 
   * opened using <a href="https://github.com/likeastore/ngDialog">ngDialog</a> 
   * as it relies on the properties and functions inserted by this utility on 
   * the scope.
   * <br/><br/>
   * The request URL has to be pased upon the dialog creation in the data
   * object with the <tt>url</tt> key
   * @constructor
   * @param {Scope} $scope <b>Injected</b>
   * @param {window} $window <b>Injected</b>: Angular wrapper around the 
   *  browser's window object
   * @memberOf svWizard.controllers
   */
  var GeneratedUrlCtrl = function($scope, $window) {
    
    /**
     * Street View request URL
     * @type {string}
     */
    this.url = $scope.ngDialogData.url;
    
    this.window_ = $window;
  };
  
  /**
   * Opens the Street View request in a new browser window
   * @method
   */
  GeneratedUrlCtrl.prototype.open = function() {
    this.window_.open(this.url);
  };
  
  return GeneratedUrlCtrl;
})();

angular.module('svWizardApp').controller( 'GeneratedUrlCtrl',['$scope', 
  '$window', svWizard.controllers.GeneratedUrlCtrl]);

var svWizard = svWizard || {};
svWizard.controllers = svWizard.controllers || {};

svWizard.controllers.SaveCtrl = (function(){
  
  /**
   * SaveCtrl controls the dialog used to save the current request. It shows an
   * input field so the user can enter or modify the name of the requests. If
   * the request is new and has never been saved before (it doesn't have an id),
   * the user will only be able to "Save As" the request, which will create a
   * new one with a new id. However, if the request is already been saved before
   * (have an id) the user will be able to choose between "Save", which may
   * change the request name but keep the same id, or "Save As", which will 
   * create a new request with a new id.
   * <br/><br/>
   * Note that this controller can only be used in a dialog opened using 
   * <a href="https://github.com/likeastore/ngDialog">ngDialog</a> as it relies
   * on the properties and functions inserted by this utility on the scope.
   * <br/><br/>
   * The request to save has to be pased upon the dialog creation in the data
   * object with the <tt>request</tt> key. Once the request is saved, it will 
   * be returned in the close dialog promise.
   * @constructor
   * @param {Scope} $scope <b>Injected</b>
   * @param {svWizard.services.RequestProvider} requestProvider <b>Injected</b>
   * @memberOf svWizard.controllers
   */
  var SaveCtrl = function($scope, requestProvider) {
    /**
     * Closes the dialog when the request is saved
     * @method
     */
    this.confirm = $scope.confirm;
    
    /**
     * @type {svWizard.services.RequestProvider}
     */
    this.requestProvider = requestProvider;
    
    /**
     * A copy of the current request provided in the dialog creation
     * @type {svWizard.models.Request}
     */
    this.request = angular.copy($scope.ngDialogData.request);
  };
  
  /**
   * Saves the request and closes the dialog returning the saved request to the
   * promise. It doesn't create a new request but rather updates an already 
   * existing one
   * @method
   */
  SaveCtrl.prototype.saveRequest = function() {
    this.request = this.requestProvider.
      updateRequest(this.request.id, this.request);
    this.confirm(this.request);
  };
  
  /**
   * Creates a new request and closes the dialog returning the saved request to 
   * the promise.
   * @method
   */
  SaveCtrl.prototype.saveRequestAs = function() {
    this.request = this.requestProvider.createRequest(this.request);
    this.confirm(this.request);
  };
  return SaveCtrl;
})();

angular.module('svWizardApp').controller( 'SaveCtrl',['$scope', 
  'RequestProvider', svWizard.controllers.SaveCtrl]);

var svWizard = svWizard || {};

svWizard.controllers = svWizard.controllers || {};
 
svWizard.controllers.ConfirmCtrl = (function(){
  /**
   * CofirmController controls a simple dialog to confirm or decline an 
   * action. Note that this controller can only be used in a dialog opened using 
   * <a href="https://github.com/likeastore/ngDialog">ngDialog</a> as it relies
   * on the properties and functions inserted by this utility on the scope.
   * <br/><br/>
   * The message to display has to be pased upon the dialog creation in the data
   * object with the <tt>message</tt> key
   * @constructor
   * @param {Scope} $scope <b>Injected</b> 
   * @memberOf svWizard.controllers 
   */
  var ConfirmCtrl = function($scope) {
    /**
     * Closes the dialog confirming the action.
     * @method
     */ 
    this.confirm = $scope.confirm;
    /**
     * Closes the dialog canceling the action.
     * @method
     */ 
    this.cancel = $scope.closeThisDialog;
    /**
     * The message to display in the dialog
     * @type {string}
     */ 
    this.message = $scope.ngDialogData.message;
  };
  
  return ConfirmCtrl;
})();

angular.module('svWizardApp').controller( 'ConfirmCtrl',['$scope', 
  svWizard.controllers.ConfirmCtrl]);

var svWizard = svWizard || {};
svWizard.controllers = svWizard.controllers || {};

svWizard.controllers.MenuCtrl = (function(){
  /**
   * MenuCtrl controls the side menu on the application. There are two sections
   * in the menu:
   * <br/>
   * <ul>
   *  <li><b>Settings</b>: the user can configure the authentication 
   *    credentials. These are obtained from the <tt>Settings</tt> service
   *  </li>
   *  <li><b>Saved requests</b>: the user can see the list of saved requests,
   *    open and delete them, and filter them by name using the search input.
   *    The operations on the saved requests are done using the 
   *    <tt>RequestProvider</tt> service
   *  </li>
   * </ul>
   * @constructor
   * @param {svWizard.services.Settings} settings <b>Injected</b>
   * @param {svWizard.services.RequestProvider} requestProvier <b>Injected</b>
   * @param {svWizard.services.State} State <b>Injected</b>
   * @param {svWizard.services.Menu} Menu <b>Injected</b>
   * @memberOf svWizard.controllers
   */
  var MenuCtrl = function(settings, requestProvider, 
    state, menu) {
    
    /**
     * @type {svWizard.services.RequestProvider}
     */
    this.provider = requestProvider;
    /**
     * @type {svWizard.services.Settings}
     */
    this.settings = settings;
    /**
     * @type {svWizard.services.State}
     */
    this.state = state;
    
    /**
     * @type {svWizard.services.Menu}
     */
    this.menu = menu;    
    
    /**
     * String to filter the saved URLs with
     * @type {string}
     */
    this.search = '';
    
    /**
     * List of messages needed in the view
     * @type {Object}
     */
    this.messages = {
      /**
       * Message to display in the delete-request confirmation dialog
       * @type {string}
       * @default
       */
      confirmDelete: 'Do you really want to delete this request? Note that ' +
        'this action cannot be undone'
    }
  };
  
  /**
   * Opens a saved request so it is displayed on the main view of the 
   * application. It does it by just copying the saved request into the current
   * request.
   * @method
   * @param {svWizard.models.Request} request the request to open
   */
  MenuCtrl.prototype.openRequest = function(request) {
    this.state.current = angular.copy(request);
    this.menu.close();
  };
  
  /**
   * Deletes a saved request from localstorage and, in case it is the current
   * request, it makes it new by removing its id and name. This is only called
   * after user's confirmation.
   * @method
   * @param {svWizard.models.Request} request the request to open
   */
  MenuCtrl.prototype.deleteRequest = function(request){
    this.provider.deleteRequest(request.id);
    if(this.state.current.id === request.id) {
      this.state.current.id = null;
      this.state.current.name = '';
    }
  }
  return MenuCtrl;
})();


angular.module('svWizardApp').controller( 'MenuCtrl', ['Settings',
'RequestProvider', 'State', 'Menu', svWizard.controllers.MenuCtrl]);
  
var svWizard = svWizard || {};
svWizard.directives = svWizard.directives || {};

svWizard.directives.svPreview = (function(){
  /**
   * The svPreview (sv-preview) directive element creates a Street View Panorama
   * object in the view, and links the positions and view direction parameters
   * to the ones provided to the scope. That means that changes in the Street 
   * View will be reflected in the provided values and changes in the values 
   * will be reflected into the Street View Panorama.
   * <br/><br/>
   * It exposes the following parameters as attributes
   * <ul>
   *  <li><b>panorama</b>: contains the Google Panorama object created within 
   *    the directive 
   *  </li>
   *  <li><b>location</b>: the LatLng coordinates of the Street View
   *  </li>
   *  <li><b>heading</b>: the heading value of the Street View
   *  </li>
   *  <li><b>pitch</b>: the pitch value of the Street View
   *  </li>
   *  <li><b>fov</b>: the fov value of the Street View
   *  </li>
   *  <li><b>size</b>: the size of the request. It will be used to calculate the
   *    aspect ratio of the request and use the same one to display the Street
   *    View.
   *  </li>
   * <ul>
   * @member {Directive} svPreview
   * @memberOf svWizard.directives
   */
  var svPreview = function($timeout, $window, Utils) {

    //Event listener creators
    function zoomListener_(scope, panorama) {
      return function() {
        $timeout(function(){
          var fov = Utils.numbers.zoom2fov(panorama.getZoom());
          //FOV cannot be > 120 in the Street View API
          if( fov > 120) {
            panorama.setZoom(Utils.numbers.fov2zoom(120));
          }else{
            scope.fov = Utils.numbers.decimalPlaces(fov,1);
          }
        });
      };
    }
    
    function povListener_(scope, panorama) {
      return function() {
        var pov = panorama.getPov();
        $timeout(function(){
          // Wrap the heading value to 360, as per the Street View API
          // specs
          // Also, use only one decimal in the numbers, as mnore precission is
          // unoticeable
          scope.heading = Utils.numbers.decimalPlaces(
            Utils.numbers.wrap(pov.heading, 360), 1);
          scope.pitch =  Utils.numbers.decimalPlaces(pov.pitch, 1);
        });
      };
    }
    
    function positionListener_(scope, panorama) {
      return function() {
        $timeout(function(){ 
          var position = panorama.getPosition();
          // Use only 5 decimal places, as more precission is unnoticeable
          scope.location.lat = Utils.numbers.decimalPlaces(
            position.lat(),5);
          scope.location.lng = Utils.numbers.decimalPlaces(
            position.lng(), 5);
          panorama.setVisible(true);
        });
      };
    }
    
    // It resizes the panorama object to match the ratio width/height of the
    // request size.
    function resizePanorama_(scope, parent, panoramaEl, panorama) {
      var parentSize = Utils.ui.getInnerSize(parent, 
        $window.getComputedStyle(parent, null));
      var pRatio = parentSize.width / parentSize.height;
      var ratio = scope.size.width / scope.size.height;
      if(pRatio > ratio) {
        panoramaEl.style.height = '100%';
        panoramaEl.style.width = ratio/pRatio * 100 + '%';
      }else{
        panoramaEl.style.width = '100%';
        panoramaEl.style.height = pRatio/ratio * 100 + '%';
      }
      // The event has to be manually triggered because if not, the panorama
      // view doesn't notice the size changed
      google.maps.event.trigger(panorama, 'resize');
    }

    return {
      restrict: 'E',
      scope: {
        panorama: '=',
        location: '=',
        heading: '=',
        pitch: '=',
        fov: '=',
        size: '='
      },
      templateUrl: 'templates/sv-unavailable.html',
      link: function(scope, element, attrs) {
        // Enable IV
        window['google']['maps']['streetViewViewer'] = 'photosphere';
        var panoramaEl = element[0];
        var container = element.parent()[0];
        
        var panorama = new google.maps.StreetViewPanorama(
          panoramaEl,
          {
            addressControl: false,
            zoomControl: false
          }
        );
        
        scope.panorama = panorama;
        //Create Listeners
        var zoomListener = zoomListener_(scope, panorama);
        var povListener = povListener_(scope, panorama);
        var positionListener = positionListener_(scope, panorama);
        
        //Register listeners
        var zoomListenerId = google.maps.event.addListener(panorama,
          'zoom_changed', zoomListener);
        var povListenerId = google.maps.event.addListener(panorama,
          'pov_changed', povListener);
        var positionListenerId = google.maps.event.addListener(panorama,
          'position_changed', positionListener);
        
        /*Listen for changes on the parameters of the scope.
          The listeners of their respective are removed before setting the new
          value to prevent an endless bucle of events
        */
        scope.$watch( 'location', function() {
          google.maps.event.removeListener(positionListenerId);
          var latLng = new google.maps.LatLng(scope.location);
          panorama.setPosition(latLng);
          positionListenerId = google.maps.event.addListener(panorama,
            'position_changed', positionListener);
        }, true);
         
        scope.$watchGroup(['heading', 'pitch'], function(){
          google.maps.event.removeListener(povListenerId);
          panorama.setPov({
            heading: scope.heading,
            pitch: scope.pitch
          });
          povListenerId = google.maps.event.addListener(panorama,
            'pov_changed', povListener);
        });
        
        scope.$watch('size', function(){
          resizePanorama_(scope, container, panoramaEl, panorama);
        }, true);

        scope.$watch( 'fov', function() {
          google.maps.event.removeListener(zoomListenerId);
          var fov = scope.fov;
          var zoom = Utils.numbers.fov2zoom(fov);
          panorama.setZoom(zoom);
          zoomListenerId = google.maps.event.addListener(panorama,
            'zoom_changed', zoomListener);
        });
        
        // Resize the panorama to match the size ratio
        resizePanorama_(scope, container, panoramaEl, panorama);
        
        // Resize the panorama everytime the container is resized
        angular.element($window).bind('resize', function() {
          resizePanorama_(scope, container, panoramaEl, panorama);
        });
      }
    };
  };
  
  return svPreview;
})();
   
angular.module('svWizardApp').directive( 'svPreview', ['$timeout', '$window', 'Utils',
  svWizard.directives.svPreview
]);

var svWizard = svWizard || {};
svWizard.directives = svWizard.directives || {};

svWizard.directives.mapPreview = (function(){
  
  /**
   * The mapPreview (map-preview) directive inserts a Google Map into the 
   * view linked to a Street View panorama so it updates its position when the
   * panorama does and also, it changes the panorama location when the pegman
   * is dropped some where.
   * <br/><br/>
   * The following attributes are included in the scope
   * <ul>
   *  <li><b>map</b>: contains the Google Map object created within the 
   *    directive 
   *  </li>
   *  <li><b>panorama</b>: the Street View panorama object to update the 
   *    position 
   *  </li>
   * <ul>
   * @member {Directive} mapPreview
   * @memberOf svWizard.directives
   */
  var mapPreview = function($timeout, $window, Utils) {
    function initMap_(element) {
      return new google.maps.Map(element.find('div')[0], {
        zoom: 16,
        zoomControl: true,
        scrollwheel: false,
        mapTypeControl: false,
        streetViewControl: true
      });
    }
    return {
      template: '<div style="width:100%;height:100%"></div>',
      scope: {
        map: '=',
        panorama: '='
      },
      link: function(scope, element, attrs) {
        var map = initMap_(element);
        /* When the panorama changes, we link it to the map */
        scope.$watch('panorama', function() {
          if(angular.isDefined(scope.panorama) && scope.panorama !== null) {
            map.setStreetView(scope.panorama);
            map.panTo(scope.panorama.getPosition());
            google.maps.event.addListener(scope.panorama,
            'position_changed', function() {
              // Listen to panorama position changes to update the center of the
              // map
              map.panTo(scope.panorama.getPosition());
            });
          }
        });
      }
    }
  }
  return mapPreview;
})();

angular.module('svWizardApp').directive( 'mapPreview', ['$timeout', '$window', 
'Utils', svWizard.directives.mapPreview
]);

var svWizard = svWizard || {};
svWizard.directives = svWizard.directives || {};

svWizard.directives.mapAutocomplete = (function(){
  /**
   * The mapAutocomplete (map-autocomplete) directive has to be applied in an 
   * input method. It will provide the Google Maps autocomplete feature to 
   * this input element. Once the user selects a place, the function provided
   * in the directive value will be called with the selected result.
   * @member {Directive} mapAutocomplete
   * @memberOf svWizard.directives
   */
  var mapAutocomplete = function($timeout) {
    return {
      restrict: 'A',
      scope: {
        mapAutocomplete: '&'
      },
      link: function(scope, element, attrs) {
        var autocomplete = new google.maps.places.Autocomplete(element[0]);
        autocomplete.addListener('place_changed', function(){
          scope.$apply();
          $timeout(function() {
            scope.mapAutocomplete({address: autocomplete.getPlace()});
          });
        });
      }
    };
  };
  return mapAutocomplete;
})();

angular.module('svWizardApp').directive( 'mapAutocomplete', [ '$timeout', 
  svWizard.directives.mapAutocomplete]);
  
var svWizard = svWizard || {};
svWizard.directives = svWizard.directives || {};

svWizard.directives.confirmAction = (function(){
  /**
   * The confirmAction (confirm-action) displays a confirmation dialog one the
   * user click into the element it is inserted in. It only executes the action
   * if the user click in the Accept or Yes button.
   * <br/><br/>
   * The action to execute upon confirmation is provided in the attribute 
   * <tt>confirm-action<tt/> and the message to display to the user in the 
   * <tt>confirm-action-message</tt>.
   * @member {Directive} confirmAction
   * @memberOf svWizard.directives
   */
  var confirmAction = function(ngDialog) {
    return {
      restrict: 'A',
      scope: {
        confirmAction: '&',
        confirmActionMessage: '@'
      },
      link: function(scope, element, attrs) {
        var action = scope.confirmAction;
        element.bind('click', function(){
          scope.$apply( function(){
            //Display message
            var message = scope.confirmActionMessage;
            ngDialog.openConfirm({
              template: 'templates/confirm.html',
              className: 'ngdialog-theme-default ngdialog-theme-custom',
              controller: 'ConfirmCtrl',
              controllerAs: 'dialog',
              data: {
                message: message
              }
            }).then(function() {
              //if confirmed by user, execute action. Do nothing otherwise
              action();
            });
          });
        });  
      }
    }
  }
  return confirmAction;
})();

angular.module('svWizardApp').directive( 'confirmAction', [ 'ngDialog',
  svWizard.directives.confirmAction]);
  