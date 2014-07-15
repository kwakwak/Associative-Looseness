

(function(){
    function FeedController(feed,token,storage){

        /**
         * Bind feed to scope
         * @param token
         */
        this.bindFeed = function(token){
            feed.get(token).success(function(feed){
                this.data = feed.data;
            }.bind(this));
        }

        /**
         * Search for the token in local storage
         * if not exist get the token form facebook and save it.
         */
        var localToken = storage.loadToken();
        if (localToken){
            this.bindFeed(localToken);
        } else {
            token.get().success(function(token){
                this.bindFeed(token);
                storage.saveToken(token);
            }.bind(this));
        }

        this.clearToken = function() {
            storage.clearToken();
        }
    }

    function TokenService(http){
        /**
         * Facebook access token
         * @returns Promise
         */
        this.get = function(){
            var url='https://graph.facebook.com/oauth/access_token';
            return http.get(url,
                {
                params:{
                    client_id     : '213438082188010' ,
                    client_secret : '6ada08fc1074d6efb740d132dcd016a3' ,
                    grant_type    : 'client_credentials'
                }
            });
        };
    }

    function FeedService(http){
        /**
         * Group feed
         * @param token
         * @returns Promise
         */
        this.get = function(token){
            var url = 'https://graph.facebook.com/v2.0/231120563712448/feed?' + token;
            return http.get(url);
        };
    }

    function StorageService (w) {

        this.saveToken = function (data) {
            w.localStorage.setItem('token', JSON.stringify(data));
            console.log('save:');
            console.log(w.localStorage);
        };

        this.loadToken = function () {
            console.log('load:');
            console.log(w.localStorage);
            return JSON.parse(w.localStorage.getItem('token'));
        };

        this.clearToken = function (data) {
            w.localStorage.removeItem('token');
            console.log('clear:');
            console.log(w.localStorage);
        };
    };

    function youtubeFilter(){
        return function(input){
            var youtube = 'http://www.youtube.com/embed/';
            var output;
            if (input) {
                if (input.substr(11,7) === 'youtube'){
                    output = youtube+input.substr(25,11)+'?autoplay=1';
                }
            }
            return output;
        }
    }

    angular.module('al',[])
        .controller({
            FeedController: ['FeedService','TokenService','StorageService',FeedController]
        })
        .service({
            TokenService   : ['$http',TokenService],
            FeedService    : ['$http',FeedService],
            StorageService : ['$window',StorageService]
        })
        .filter ({
            youtubeFilter  : [youtubeFilter]
        })
        .config(function($sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'http://www.youtube.com/**'
            ]);
    });
}());
