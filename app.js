
(function(){
    /**
     * Main Controller
     * @param scope
     * @constructor
     */

    function MainController(scope){
        scope.$on('anEvent', ProcessEvent);

        function ProcessEvent (event, data) {
            scope.$broadcast('parentEvent', data);
        }
    }

    /**
     * Feed Controller
     * @param scope
     * @constructor
     */
    function FeedController(scope){
        scope.$on('parentEvent',function(event,res){
            switch(res.event) {
                case 'ALfeed':
                        this.data = res.fb.data;
                        this.status.loading = false;
                    break;
                case 'logout':
                        this.data = [];
                        this.status.loading = true;
                    break;
            }
        }.bind(this));

        this.status ={
            loading : true
        };
    };

    /**
     * Facebook Controller
     * @param ezfb
     * @param scope
     * @constructor
     */

    function FacebookController (ezfb,scope){

        var getUser = function () {
            ezfb.api('/me', function (res) {
                this.user = res;
            }.bind(this));
        }.bind(this);


        this.login = function () {
            ezfb.login(function (res) {
                if (res.authResponse) {
                    getUser();
                    this.getGroupFeed(231120563712448);
                }
            }.bind(this), {scope: 'user_groups'});
        };

        this.logout = function () {
            ezfb.logout(function () {
                this.user=false;
                scope.$emit ('anEvent',{event: 'logout'});
            }.bind(this));
        }.bind(this);

        this.getGroupFeed = function (groupID) {
            ezfb.api('/'+groupID+'/feed/', function (res) {
                scope.$emit ('anEvent',{
                    event: 'ALfeed',
                    fb: res
                });
            }.bind(this));
        };

        ezfb.getLoginStatus(function (res) {
            if (res.authResponse){
                getUser();
                this.getGroupFeed(231120563712448);
            }
        }.bind(this));
    };

    /**
     * Youtube filter
     * @returns {Function}
     */

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

    angular.module('al',['ezfb'])
        .controller({
            MainController: ['$scope',MainController],
            FeedController: ['$scope',FeedController],
            FacebookController: ['ezfb','$scope' , FacebookController]
        })
        .filter ({
            youtubeFilter  : [youtubeFilter]
        })
        .config(function($sceDelegateProvider,ezfbProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'http://www.youtube.com/**'
            ]);

            ezfbProvider.setLocale('en_US');
            ezfbProvider.setInitParams({
                appId: '213438082188010',
                version: 'v2.0'
            });

        });
}());
