var app = angular.module('app', ['ngRoute', 'angular-oauth2',
    'app.services', 'app.controllers', 'app.filters', 'app.directives', 'ui.bootstrap', 'ngFileUpload']);

angular.module('app.controllers', ['angular-oauth2', 'ngMessages']);
angular.module('app.services', ['ngResource']);
angular.module('app.filters', []);
angular.module('app.directives', []);

app.provider('appConfig', ['$httpParamSerializerProvider', function ($httpParamSerializerProvider) {
    var config = {
        baseUrl: 'http://localhost:8000',
        project: {
            status: [
                {value: 1, label: 'Não iniciado'},
                {value: 2, label: 'Iniciado'},
                {value: 3, label: 'Finalizado'}
            ]
        },
        urls: {
            projectFile: '/project/{{idProject}}/file/{{idFile}}'
        },
        utils: {
            transformRequest : function(data){
                if (angular.isObject(data)){
                    return $httpParamSerializerProvider.$get()(data);
                }
                return data;
            },
            transformResponse: function (data, headers) {
                var header = headers();
                if (header['content-type'] === 'application/json' || header['content-type'] === 'text/json') {
                    var dataJson = angular.fromJson(data);
                    if (dataJson.hasOwnProperty('data')) {
                        dataJson = dataJson.data;
                    }
                    return dataJson;
                }
                return data;
            }
        }
    };
    return {
        config: config,
        $get: function () {
            return config;
        }
    };
}]);

app.config(['$routeProvider', '$httpProvider', 'OAuthProvider', 'OAuthTokenProvider', 'appConfigProvider',
    function ($routeProvider, $httpProvider, OAuthProvider, OAuthTokenProvider, appConfigProvider) {
        // $httpProvider.defaults.headers.post['Content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        // $httpProvider.defaults.headers.put['Content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.transformResponse = appConfigProvider.config.utils.transformResponse;
        // $httpProvider.defaults.transformRequest = appConfigProvider.config.utils.transformRequest;
        $httpProvider.interceptors.push('oauthFixInterceptor');
        OAuthProvider.configure({
            baseUrl: appConfigProvider.config.baseUrl,
            clientId: 'appid1',
            clientSecret: 'secret',
            grantPath: '/oauth/access_token',
            revokePath: '/oauth/access_token'
        });
        OAuthTokenProvider.configure({
            name: 'token',
            options: {
                secure: false
            }
        });
        $routeProvider.otherwise({redirectTo: '/home'});
    }]);

app.run(['$rootScope', '$window','$location', 'OAuth', function ($rootScope, $window,$location, OAuth) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.$$route.originalPath != '/login'){
            if (!OAuth.isAuthenticated()){
                $location.path('login');
            }
        }
    });

    $rootScope.$on('oauth:error', function (event, rejection) {
        // Ignore `invalid_grant` error - should be catched on `LoginController`.
        if ('invalid_grant' === rejection.data.error) {
            return;
        }

        // Refresh token when a `invalid_token` error occurs.
        if ('access_denied' === rejection.data.error) {
            OAuth.getRefreshToken();
            $window.location.reload();
            return;
        }

        // Redirect to `/login` with the `error_reason`.
        $location.path('login');
    });
}]);