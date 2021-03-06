"use strict";

function routeConfig(t) {
    t.when("/", {
        templateUrl: "app/main/main.html",
        controller: "MainCtrl",
        controllerAs: "ctrl"
    }).when("/welcome", {templateUrl: "app/welcome/welcome.html"}).otherwise({redirectTo: "/"})
}

function locationConfig(t) {
    t.html5Mode({enabled: !0, requireBase: !0})
}

function storageConfig(t) {
    t.setPrefix("crosswatch").setStorageCookie(30, "/crosswatch/")
}

function themeConfig(t) {
    t.theme("default").primaryPalette("indigo").accentPalette("red")
}

function socketFactory(t, e, n) {
    var a = e.baseHref(), i = a + "sockjs";
    return "localhost" === n.host() && (i = "http://localhost:5000/crosswatch/sockjs"), t({url: i})
}

function stopEventDirective() {
    return {
        restrict: "A", link: function (t, e) {
            e.bind("click", function (t) {
                t.stopPropagation()
            })
        }
    }
}

function user() {
    function t(t, e, n) {
        t.user = "undefined" != typeof n.name ? n.name : t.event.user;
        var a = t.user.split(":");
        t.user = a[a.length - 1]
    }

    var e = {
        link: t,
        scope: !0,
        template: '<a stop-event dir="auto" href="{{::event.projecturl}}/wiki/User:{{::user | urlEncode}}" target="_blank">{{::user}}</a> <span dir="auto" ng-if="event.showDiff">(<a stop-event href="{{::event.projecturl}}/wiki/Special:Contributions/{{::user | urlEncode}}" target="_blank" translate="CONTRIBS"></a>)</span>&#32;',
        restrict: "E"
    };
    return e
}

function page() {
    function t(t, e, n) {
        t.title = "undefined" != typeof n.title ? n.title : t.event.title
    }

    var e = {
        link: t,
        scope: !0,
        template: '<a stop-event href="{{::event.projecturl}}/wiki/{{::title | urlEncode}}"  target="_blank">{{::title}}</a> <span ng-if="event.showDiff">(<a stop-event href="{{::event.projecturl}}/w/index.php?title={{::title | urlEncode}}&action=history" target="_blank" translate="HISTORY"></a>)</span>&#32;',
        restrict: "E"
    };
    return e
}

function watchlistLogevent() {
    function t(t) {
        function e(t) {
            return !isNaN(parseFloat(t))
        }

        for (var n in t.event.logparams) t.event.logparams.hasOwnProperty(n) && (e(n) || t.event.hasOwnProperty(n) || (t.event[n] = t.event.logparams[n]));
        "move_prot" === t.event.logaction ? t.event.target_title = t.event.logparams[0] : "protect" === t.event.logtype && (t.event.protection_level = t.event.logparams[0])
    }

    var e = {link: t, templateUrl: "components/watchlist/logevent.directive.html", restrict: "E"};
    return e
}

function watchlistEntry() {
    var t = {templateUrl: "components/watchlist/entry.directive.html", restrict: "EA"};
    return t
}

function watchlistEdit() {
    function t(t) {
        function e(t) {
            var e = t.toLocaleString();
            return t > 0 && (e = "+" + e), e
        }

        function n(t) {
            var e;
            return e = -500 >= t ? "text-danger strong" : 0 > t ? "text-danger" : 0 === t ? "text-muted" : t >= 500 ? "text-success strong" : "text-success"
        }

        function a(t) {
            return t ? "mw-title" : ""
        }

        var i = t.event.newlen - t.event.oldlen;
        t.event.bytes = e(i), t.event.bytestyle = n(i), t.event.titlestyle = a(t.event.notificationtimestamp)
    }

    var e = {
        link: t, scope: !0, templateUrl: function (t, e) {
            return "components/watchlist/edit_" + e.type + ".directive.html"
        }, restrict: "E"
    };
    return e
}

function comment(t) {
    function e(e, n) {
        var a = e.event.parsedcomment;
        n.html(t(a)), n.find("a").bind("click", function (t) {
            t.stopPropagation()
        })
    }

    var n = {link: e, restrict: "E"};
    return n
}

function customInterpolation(t, e) {
    var n, a = {}, i = "custom";
    return a.setLocale = function (t) {
        n = t
    }, a.getInterpolationIdentifier = function () {
        return i
    }, a.interpolate = function (n, a) {
        n = n.replace(/(<([a-z\-]{2,})\s?[^>]*?>)/g, "$1</$2>").replace(/({{[\w|]+}})>/g, '"$1">'), a = a || {}, a = e.sanitize(a, "params");
        var i = t(n)(a);
        return i = e.sanitize(i, "text")
    }, a
}

function authService(t) {
    this.isLoggedIn = function () {
        var e = t.cookie.get("version");
        return 1 !== e ? (t.cookie.clearAll(), !1) : null !== t.cookie.get("auth")
    }, this.tokens = function () {
        return angular.fromJson(t.cookie.get("auth").replace(/\\054/g, ","))
    }, this.user = function () {
        return t.cookie.get("user")
    }
}

function dataService(t, e, n, a, i, o, s, l) {
    var r = this;
    r.watchlist = {}, r.watchlist.original = [], r.watchlist.filtered = [], r.watchlist.active = [], r.watchlist.perProject = {}, r.watchlist.loading = !0, r.watchlist.dict = {}, r.notifications = [], r.defaultconfig = {
        lastrevonly: !0,
        watchlistperiod: 1.5,
        flagsenable: !1,
        editflags: !1,
        projectsList: !1,
        projectsSelected: !1,
        namespacesList: ["0", "1", "2", "3", "4", "5", "6", "7", "10", "11", "12", "13", "OTHER"],
        username: "",
        hideOwnEdits: !1,
        oresDiff: !0,
        flaggedrevsDiff: !0,
        subdivided: !1
    }, null !== n.get("config") ? (r.config = n.get("config"), r.config.__proto__ = r.defaultconfig) : r.config = Object.create(r.defaultconfig), r.config.projectsList = r.config.projectsList || [], r.config.projectsSelected = r.config.projectsSelected || [], r.config.editflags = r.config.editflags || {
        minor: !0,
        bot: !1,
        anon: !0,
        registered: !0
    }, r.config.namespacesSelected = r.config.namespacesSelected || r.defaultconfig.namespacesList, r.config.projectColors = r.config.projectColors || {};
    var c = ["pink", "deep-purple", "blue", "cyan", "green", "lime", "orange", "brown", "blue-grey"], d = 0;
    r.saveConfig = function () {
        n.set("config", r.config)
    }, r.addWatchlistEntries = function (t) {
        Array.prototype.push.apply(r.watchlist.original, t), r.watchlist.original.sort(function (t, e) {
            return new Date(e.timestamp) - new Date(t.timestamp)
        });
        var e = t[0].project;
        -1 === r.config.projectsList.indexOf(e) && (r.config.projectsList.push(e), r.config.projectsSelected.push(e), r.saveConfig()), r.config.projectColors.hasOwnProperty(e) || (r.config.projectColors[e] = "project-color-" + c[d], d += 1, d >= c.length && (d = 0), r.saveConfig()), r.filterWatchlistDebounced();
        for (var n = 0; n < t.length; n++) r.watchlist.dict[t[n].id] = t[n];
        Array.isArray(r.watchlist.perProject[e]) ? Array.prototype.push.apply(r.watchlist.perProject[e], t) : r.watchlist.perProject[e] = t
    }, r.moreWatchlistEntries = function () {
        a.info("showing 50 more watchlist entries");
        var t = r.watchlist.filtered.slice(r.watchlist.active.length, r.watchlist.active.length + 50);
        Array.prototype.push.apply(r.watchlist.active, t)
    }, r.filterWatchlist = function (t) {
        if (0 !== r.watchlist.original.length) {
            a.info("showing first watchlist entries (maximum 100)"), r.watchlist.filtered = i("watchlist")(r.watchlist.original, r.config), "undefined" != typeof t && (r.watchlist.filtered = i("filter")(r.watchlist.filtered, t));
            var e = r.watchlist.filtered.slice(0, 100);
            r.watchlist.active.length = 0, Array.prototype.push.apply(r.watchlist.active, e), r.watchlist.loading = !1
        }
    }, r.filterWatchlistDebounced = o(r.filterWatchlist, 250), r.resetWatchlist = function () {
        r.watchlist.original = [], r.watchlist.filtered = [], r.watchlist.dict = {}, r.watchlist.active.length = 0, r.notifications.length = 0, r.watchlist.loading = !0, r.watchlist.perProject = {}, r.queryWatchlist(), r.saveConfig()
    }, r.addNotificationEntries = function (t) {
        r.notifications.push(t)
    }, r.markNotificationsRead = function () {
        for (var n = {}, a = 0; a < r.notifications.length; a++) {
            var i = r.notifications[a];
            n.hasOwnProperty(i.project) || (n[i.project] = []), n[i.project].push(i.id)
        }
        var o = {action: "notifications_mark_read", access_token: e.tokens(), notifications: n};
        t.send(angular.toJson(o))
    }, r.queryWatchlist = function () {
        if (e.isLoggedIn()) {
            var n = {
                action: "watchlist",
                access_token: e.tokens(),
                watchlistperiod: r.config.watchlistperiod,
                allrev: !r.config.lastrevonly,
                projects: r.config.projectsList,
                uselang: l.use() || ""
            };
            try {
                t.send(angular.toJson(n))
            } catch (i) {
                "InvalidStateError: The connection has not been established yet" === i.message ? a.warn("Wachtlist queried before socketjs connected.") : a.error(i)
            }
        }
    };
    var m = {}, g = 0;
    r.getRequestId = function () {
        return g++
    }, r.query = function (n) {
        n.request_id = r.getRequestId(), n.access_token = e.tokens(), n.uselang = l.use() || "";
        var a = s.defer();
        return m[n.request_id] = a, t.send(angular.toJson(n)), a.promise.then(function (t) {
            return n.response = t, t
        })
    }, r.responseHandler = function (t) {
        if (angular.isDefined(m[t.request_id])) {
            var e = m[t.request_id];
            delete m[t.request_id], e.resolve(t.data)
        } else a.error("No callback for diff: %o", t)
    }, r.oresScoresHandler = function (t) {
        r.watchlist.dict[t.id].diff = t.diff, r.watchlist.dict[t.id].showDiff = r.config.oresDiff, r.watchlist.dict[t.id].oresProbability = t.oresProbability
    }, r.flaggedrevsHandler = function (t) {
        r.watchlist.dict[t.id].diff = t.diff, r.watchlist.dict[t.id].showDiff = r.config.flaggedrevsDiff, r.watchlist.dict[t.id].stableRevid = t.stableRevid
    }, r.icons = {}, r.icons.wikibooks = "//upload.wikimedia.org/wikipedia/commons/f/fa/Wikibooks-logo.svg", r.icons.wiktionary = "//upload.wikimedia.org/wikipedia/commons/e/ef/Wikitionary.svg", r.icons.wikiquote = "//upload.wikimedia.org/wikipedia/commons/f/fa/Wikiquote-logo.svg", r.icons.wikipedia = "//upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg", r.icons.wikinews = "//upload.wikimedia.org/wikipedia/commons/2/24/Wikinews-logo.svg", r.icons.wikivoyage = "//upload.wikimedia.org/wikipedia/commons/8/8a/Wikivoyage-logo.svg", r.icons.wikisource = "//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg", r.icons.wikiversity = "//upload.wikimedia.org/wikipedia/commons/9/91/Wikiversity-logo.svg", r.icons.foundation = "//upload.wikimedia.org/wikipedia/commons/c/c4/Wikimedia_Foundation_RGB_logo_with_text.svg", r.icons.mediawiki = "//upload.wikimedia.org/wikipedia/commons/3/3d/Mediawiki-logo.png", r.icons.meta = "//upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg", r.icons.wikidata = "//upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg", r.icons.commons = "//upload.wikimedia.org/wikipedia/commons/4/4a/Commons-logo.svg", r.icons.species = "//upload.wikimedia.org/wikipedia/en/b/bf/Wikispecies-logo-35px.png", r.icons.incubator = "//upload.wikimedia.org/wikipedia/commons/e/e3/Incubator-logo.svg", r.icons.test = "//upload.wikimedia.org/wikipedia/commons/4/4a/Wikipedia_logo_v2_%28black%29.svg", r.flags = ["ad", "ae", "af", "ag", "ai", "al", "am", "an", "ao", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cs", "cu", "cv", "cx", "cy", "cz", "da", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "en", "er", "es", "et", "fam", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "he", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "in", "io", "iq", "ir", "is", "it", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "scotland", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "sv", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wales", "wf", "ws", "ye", "yt", "za", "zh", "zm", "zw"], r.flagurl = function (t) {
        return r.flags.indexOf(t) >= 0 ? "assets/images/flags/png/" + t + ".png" : !1
    }
}

function debounceService(t, e) {
    return function (n, a, i) {
        var o, s = e.defer();
        return function () {
            var l = this, r = arguments, c = function () {
                o = null, i || (s.resolve(n.apply(l, r)), s = e.defer())
            }, d = i && !o;
            return o && t.cancel(o), o = t(c, a), d && (s.resolve(n.apply(l, r)), s = e.defer()), s.promise
        }
    }
}

function runBlock(t, e, n, a, i, o, s, l, r, c, d) {
    function m() {
        f && (a.warn("No websocket message after 20 seconds."), o(["SERVER_ERROR_TITLE", "SERVER_ERROR_CONTENT", "CLOSE"]).then(function (t) {
            g({title: t.SERVER_ERROR_TITLE, content: t.SERVER_ERROR_CONTENT, ok: t.CLOSE})
        }))
    }

    function g(t) {
        var e = r.alert(t);
        v.push(e), p()
    }

    function p() {
        !h && v.length && (h = v.shift(), r.show(h).finally(function () {
            h = !1, p()
        }))
    }

    e.$on("$routeChangeStart", function () {
        c.isLoggedIn() ? (n.config.username = c.user(), d.path("/")) : d.path("/welcome")
    });
    var u = o.use();
    "undefined" == typeof u && (u = l.get("NG_TRANSLATE_LANG_KEY"), o.use(u)), s.changeLocale(u), t.setHandler("open", function () {
        a.info("sockjs connected"), c.isLoggedIn() && (n.queryWatchlist(), i(m, 15e3))
    });
    var f = !0;
    t.setHandler("message", function (t) {
        t = angular.fromJson(t);
        var e = angular.fromJson(t.data);
        "watchlist" === e.msgtype ? n.addWatchlistEntries(e.entires) : "notification" === e.msgtype ? n.addNotificationEntries(e) : "response" === e.msgtype ? n.responseHandler(e) : "ores_scores" === e.msgtype ? n.oresScoresHandler(e) : "flaggedrevs" === e.msgtype ? n.flaggedrevsHandler(e) : "canary" === e.msgtype ? (f = !1, i(function () {
            n.watchlist.loading = !1
        }, 2e4)) : "loginerror" === e.msgtype ? (a.error("login failed with: " + e.errorinfo), o(["OAUTH_FAILURE_TITLE", "OAUTH_FAILURE_CONTENT", "CLOSE"], {error: e.errorinfo}).then(function (t) {
            g({title: t.OAUTH_FAILURE_TITLE, content: t.OAUTH_FAILURE_CONTENT, ok: t.CLOSE})
        })) : "apierror" === e.msgtype ? (a.error("API error: " + e.errorinfo), o(["SERVER_ERROR_TITLE", "API_ERROR_CONTENT", "CLOSE"], {
            errorcode: e.errorcode,
            errorinfo: e.errorinfo
        }).then(function (t) {
            g({title: t.SERVER_ERROR_TITLE, content: t.API_ERROR_CONTENT, ok: t.CLOSE})
        })) : a.error("Unhandled message: %o", e), f && (f = !1)
    });
    var h = !1, v = []
}

function urlEncodeFilter() {
    return window.encodeURIComponent
}

function listFilter() {
    return function (t) {
        t = t || [];
        var e = t.join(", ");
        return 0 === e.length && (e = "–"), e = "(" + e + ")"
    }
}

function watchlistFilter() {
    function t(t) {
        var e = projectsFilterFunc(t, this.projectsSelected);
        return e && (e = editsflagsFilterFunc(t, this.editflags)), e && (e = namespaceFilterFunc(t, this.namespacesSelected, this.namespacesList)), e && this.hideOwnEdits && (e = usernameFilterFunc(t, this.username)), e
    }

    return function (e, n) {
        return "undefined" == typeof e ? !1 : e.filter(t, n)
    }
}

function projectsFilterFunc(t, e) {
    return e.indexOf(t.project) > -1
}

function editsflagsFilterFunc(t, e) {
    if ("log" === t.type) return !0;
    var n = e.minor || !t.minor, a = e.bot || !t.bot, i = e.anon || !("" === t.anon),
        o = e.registered || !(0 !== t.userid);
    return n && a && i && o
}

function namespaceFilterFunc(t, e, n) {
    return e.indexOf(t.ns.toString()) > -1 ? !0 : e.indexOf("OTHER") > -1 && -1 === n.indexOf(t.ns.toString()) ? !0 : !1
}

function usernameFilterFunc(t, e) {
    return t.user !== e
}

function projectsFilter() {
    return function (t, e) {
        return t.filter(projectListFilterFunc, e)
    }
}

function projectListFilterFunc(t) {
    return this.projectsSelected.indexOf(t) > -1
}

angular.module("crosswatch", ["ngAnimate", "ngSanitize", "ngRoute", "ngMaterial", "LocalStorageModule", "pascalprecht.translate", "angular-translate-storage", "bd.sockjs", "angularMoment", "infinite-scroll"]).config(routeConfig).config(locationConfig).config(storageConfig).config(themeConfig).factory("socket", socketFactory).directive("stopEvent", stopEventDirective), routeConfig.$inject = ["$routeProvider"], locationConfig.$inject = ["$locationProvider"], storageConfig.$inject = ["localStorageServiceProvider"], themeConfig.$inject = ["$mdThemingProvider"], socketFactory.$inject = ["socketFactory", "$browser", "$location"], angular.module("crosswatch").controller("WatchlistCtrl", ["$log", "dataService", function (t, e) {
    var n = this;
    n.icons = e.icons, n.flagurl = e.flagurl, n.watchlist = e.watchlist, n.config = e.config, n.moreWatchlistEntries = e.moreWatchlistEntries, n.search = function (t) {
        e.filterWatchlist(t)
    }, n.clicked = function (t) {
        t.showDiff = !t.showDiff, "edit" !== t.type || t.diff || n.getDiff(t).then(function (e) {
            t.diff = e
        })
    }, n.watchPage = function (t, n) {
        var a = {action: "watch", projecturl: t.projecturl, status: n, title: t.title};
        e.query(a).then(function (e) {
            t.isUnwatched = !e
        })
    }, n.getDiff = function (t) {
        var n = {action: "diff", projecturl: t.projecturl, old_revid: t.old_revid, revid: t.revid, pageid: t.pageid};
        return e.query(n)
    }
}]), angular.module("crosswatch").directive("user", user), angular.module("crosswatch").directive("page", page), angular.module("crosswatch").directive("watchlistLogevent", watchlistLogevent), angular.module("crosswatch").directive("watchlistEntry", watchlistEntry), angular.module("crosswatch").directive("watchlistEdit", watchlistEdit), angular.module("crosswatch").directive("comment", comment), comment.$inject = ["$sanitize"], angular.module("crosswatch").controller("SettingsCtrl", ["$translate", "$log", "dataService", "$rootScope", "debounce", function (t, e, n, a, i) {
    function o() {
        var e = [.5, 1, 1.5], n = [2, 3, 7, 14, 21, 30];
        l.periodList.length = 0;
        for (var a = function (t) {
            return function (e) {
                l.periodList.push({value: t, label: e})
            }
        }, i = 0; i < e.length; i++) t("SHOW_LAST_HOURS", {number: 24 * e[i]}).then(a(e[i]));
        for (var o = 0; o < n.length; o++) t("SHOW_LAST_DAYS", {number: n[o]}).then(a(n[o]))
    }

    function s() {
        for (var e = l.config.namespacesList, n = [], a = 0; a < e.length; a++) n.push("NS_" + e[a]);
        t(n).then(function (t) {
            l.namespacesList.length = 0;
            for (var a = 0; a < e.length; a++) l.namespacesList.push({value: e[a], label: t[n[a]]})
        })
    }

    var l = this;
    l.config = n.config, l.saveConfig = function () {
        n.saveConfig(), n.filterWatchlist()
    }, l.namespacesList = [], l.periodList = [], i(o, 150)(), i(s, 150)(), a.$on("$translateChangeSuccess", function () {
        i(o, 20)(), i(s, 20)()
    }), l.resetWatchlist = function () {
        e.info("resetting watchlist"), n.resetWatchlist()
    }
}]), angular.module("crosswatch").controller("NotificationsCtrl", ["$translate", "$log", "dataService", function (t, e, n) {
    var a = this;
    a.icons = n.icons, a.flagurl = n.flagurl, a.notifications = n.notifications, a.config = n.config, a.markNotificationsRead = n.markNotificationsRead
}]), angular.module("crosswatch").controller("NavbarCtrl", ["translationList", "$translate", "$rootScope", "authService", "amMoment", "localStorageService", "textDirection", function (t, e, n, a, i, o, s) {
    function l(e) {
        for (var n = 0; n < t.length; n++) e === t[n].key && (s.dir = t[n].dir)
    }

    var r = this;
    r.langs = t, r.selectedLang = e.use(), r.loggedin = a.isLoggedIn(), "undefined" == typeof r.selectedLang && (r.selectedLang = o.get("NG_TRANSLATE_LANG_KEY")), l(r.selectedLang), r.changeLanguage = function (t) {
        i.changeLocale(t), e.use(t), l(t)
    }
}]), angular.module("crosswatch").controller("MainCtrl", ["textDirection", "dataService", function (t, e) {
    var n = this;
    n.textDirection = t, n.config = e.config
}]), angular.module("crosswatch").value("textDirection", {dir: "ltr"}).config(["$translateProvider", "translationList", function (t, e) {
    for (var n = [], a = {}, i = 0; i < e.length; i++) if (n.push(e[i].key), e[i].hasOwnProperty("usescases")) for (var o = 0; o < e[i].usecases.length; o++) a[e[i].usecases[o]] = e[i].key;
    var s = "-f4bee95c";
    t.useSanitizeValueStrategy("sanitizeParameters").useStorage("translateStorage").addInterpolation("customInterpolation").useStaticFilesLoader({
        prefix: "i18n/",
        suffix: s + ".json"
    }).registerAvailableLanguageKeys(n, a).determinePreferredLanguage().fallbackLanguage("en")
}]).factory("customInterpolation", customInterpolation), customInterpolation.$inject = ["$interpolate", "$translateSanitization"], angular.module("crosswatch").constant("translationList", [{
    key: "de",
    language: "Deutsch",
    dir: "ltr"
}, {key: "en", language: "English", dir: "ltr"}, {
    key: "pt",
    language: "português",
    dir: "ltr"
}]), angular.module("crosswatch").service("authService", authService).service("dataService", dataService).factory("debounce", debounceService), authService.$inject = ["localStorageService"], dataService.$inject = ["socket", "authService", "localStorageService", "$log", "$filter", "debounce", "$q", "$translate"], debounceService.$inject = ["$timeout", "$q"], angular.module("crosswatch").run(runBlock), runBlock.$inject = ["socket", "$rootScope", "dataService", "$log", "$timeout", "$translate", "amMoment", "localStorageService", "$mdDialog", "authService", "$location"], angular.module("crosswatch").filter("urlEncode", urlEncodeFilter).filter("list", listFilter).filter("watchlist", watchlistFilter).filter("projectList", projectsFilter), angular.module("crosswatch").run(["$templateCache", function (t) {
    t.put("app/welcome/welcome.html", '<header ng-include="\'components/navbar/navbar.html\'"></header><div layout="column" flex="" class="md-padding" id="welcome"><div layout="row" layout-align="center center" flex=""><md-card flex-sm="90"><md-card-content layout="column" layout-align="center center"><h1>crosswatch</h1><p class="text-center" translate="DESCRIPTION"></p><md-button href="login" target="_self" class="md-raised md-accent">{{\'SIGN_IN_BUTTON\' | translate}}</md-button></md-card-content></md-card></div></div><ng-include src="\'components/footer/footer.html\'"></ng-include>'), t.put("app/main/main.html", '<div dir="{{ctrl.textDirection.dir}}"><header ng-include="\'components/navbar/navbar.html\'"></header><div layout="column" flex="" class="md-padding" role="main"><div ng-include="\'components/settings/settings.html\'"></div><div ng-include="\'components/notifications/notifications.html\'"></div><div ng-if="!ctrl.config.subdivided" ng-include="\'components/watchlist/unified.html\'"></div><div ng-if="ctrl.config.subdivided" ng-include="\'components/watchlist/seperated.html\'"></div></div><ng-include src="\'components/footer/footer.html\'"></ng-include></div>'), t.put("components/footer/footer.html", '<div role="footer" layout="row" layout-align="space-around center"><p class="text-muted">Maintained by <a href="//de.wikipedia.org/wiki/Benutzer:Sitic" title="sitic @ de.wikipedia">sitic</a>. <a href="https://git.wikimedia.org/summary/labs%2Ftools%2Fcrosswatch">Code</a> licensed under the <a href="https://en.wikipedia.org/wiki/ISC_license">ISC License</a>.</p><p class="pull-right"><a href="//tools.wmflabs.org"><img id="footer-icon" src="//tools.wmflabs.org/static/res/logos/powered-by-tool-labs.png" width="105" height="40" title="Powered by Wikimedia Tool Labs" alt="Powered by Wikimedia Tool Labs"></a></p></div>'), t.put("components/navbar/navbar.html", '<md-toolbar layout="row" layout-align="center center" ng-controller="NavbarCtrl as ctrl" class="md-toolbar-tools"><md-select ng-model="ctrl.selectedLang" placeholder="Language" ng-change="ctrl.changeLanguage(ctrl.selectedLang)"><md-option ng-repeat="lang in ctrl.langs" value="{{lang.key}}">{{lang.language}}</md-option></md-select><md-button href="https://meta.wikimedia.org/wiki/Talk:Crosswatch" target="_blank" class="md-flat nouppercase">{{\'TALK\' | translate}}</md-button><md-button href="https://meta.wikimedia.org/wiki/Crosswatch" target="_blank" class="md-flat nouppercase">{{\'DOCUMENTATION\' | translate}}</md-button><md-button href="https://phabricator.wikimedia.org/project/view/1224/" target="_blank" class="md-flat nouppercase">{{\'REPORT_BUGS\' | translate}}</md-button><md-button href="login" target="_self" class="md-flat nouppercase" ng-hide="ctrl.loggedin">{{\'SIGN_IN\' | translate}}</md-button><md-button href="logout" target="_self" class="md-flat nouppercase" ng-show="ctrl.loggedin">{{\'SIGN_OUT\' | translate}}</md-button></md-toolbar>'), t.put("components/notifications/notifications.html", '<div ng-controller="NotificationsCtrl as ctrl"><div ng-if="ctrl.notifications.length" layout="row" layout-align="center center" class="md-padding"><md-whiteframe class="md-whiteframe-z5" ng-class="(ctrl.config.oneline) ? \'whitebox-oneline\' : \'whitebox\'"><md-toolbar class="md-small-tall"><div class="md-toolbar-tools"><h1><span translate="NOTIFICATIONS"></span></h1><div flex=""></div><md-button class="md-raised md-accent" aria-label="mark all notifications as read" translate="MARKALLREAD" ng-click="read = !read; ctrl.markNotificationsRead()" ng-disabled="read"></md-button></div></md-toolbar><md-list><md-list-item layout="row" class="notifications" style="padding: 6px 16px;" ng-repeat="event in ctrl.notifications | orderBy:\'-timestamp\' track by event.uuid"><div class="left"><a href="{{::event.projecturl}}/wiki/Special:Notifications" class="project" title="{{::event.project}}" target="_blank"><img height="16px" ng-src="{{::ctrl.icons[event.projectgroup]}}" alt="{{::event.projectgroup}}"> <span ng-if="::event.projectlang"><span ng-if="!ctrl.config.flagsenable || !ctrl.flagurl(event.projectlang)">{{::event.projectlangname}}</span> <img ng-if="ctrl.config.flagsenable && ctrl.flagurl(event.projectlang)" height="13px" style="margin-bottom: 2px" ng-src="{{::ctrl.flagurl(event.projectlang)}}"></span></a></div><div ng-bind-html="::event.comment"></div><md-divider></md-divider></md-list-item></md-list></md-whiteframe></div></div>'), t.put("components/settings/settings.html", '<div ng-controller="SettingsCtrl as ctrl" layout="row" layout-align="center start"><md-whiteframe class="md-whiteframe-z5" ng-class="(ctrl.config.oneline) ? \'whitebox-oneline\' : \'whitebox\'" id="settings"><md-tabs md-dynamic-height="" md-border-bottom=""><md-tab label="{{\'FILTER\' | translate}}"><div layout="row"><div flex="50"><md-list layout="column" class="md-padding"><md-subheader class="md-no-sticky">{{\'WIKIS\' | translate}}</md-subheader><md-item><md-select ng-model="ctrl.config.projectsSelected" multiple="true" placeholder="Loading …" aria-label="List of selected wikis" ng-change="ctrl.saveConfig()"><md-option ng-repeat="item in ctrl.config.projectsList" value="{{item}}">{{item}}</md-option></md-select></md-item><md-subheader class="md-no-sticky">{{\'NAMESPACES\' | translate}}</md-subheader><md-item><md-select ng-model="ctrl.config.namespacesSelected" multiple="true" ng-change="ctrl.saveConfig()" aria-label="List of selected namespaces"><md-option ng-repeat="item in ctrl.namespacesList" value="{{item.value}}">{{item.label}}</md-option></md-select></md-item></md-list></div><md-divider role="vertical"></md-divider><md-list flex="50"><div layout="column" class="md-padding"><md-subheader class="md-no-sticky">{{\'FILTER\' | translate}}</md-subheader><md-item layout="row"><md-list flex="50"><md-list-item><p translate="MINOR_EDITS"></p><md-checkbox ng-model="ctrl.config.editflags.minor" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item><md-list-item><p translate="BOT_EDITS"></p><md-checkbox ng-model="ctrl.config.editflags.bot" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item></md-list><md-list flex="50"><md-list-item><p translate="ANON_EDITS"></p><md-checkbox ng-model="ctrl.config.editflags.anon" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item><md-list-item><p translate="USER_EDITS"></p><md-checkbox ng-model="ctrl.config.editflags.registered" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item></md-list></md-item><md-subheader class="md-no-sticky">{{\'STYLE\' | translate}}</md-subheader><md-list-item><p translate="ONELINE"></p><md-checkbox ng-model="ctrl.config.oneline" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item><md-list-item><p translate="SUBDIVIDED"></p><md-checkbox ng-model="ctrl.config.subdivided" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item></div></md-list></div></md-tab><md-tab label="{{\'PREFERENCES\' | translate}}"><div layout="row"><div flex="50"><md-list layout="column" class="md-padding"><md-item id="timeperiod"><md-select ng-model="ctrl.config.watchlistperiod" placeholder="Timeperiod" ng-change="ctrl.resetWatchlist()"><md-option ng-repeat="item in ctrl.periodList" value="{{item.value}}" id="timeperiod">{{item.label}}</md-option></md-select></md-item><md-list-item><p translate="LASTREVONLY"></p><md-checkbox ng-model="ctrl.config.lastrevonly" ng-change="ctrl.resetWatchlist()"></md-checkbox></md-list-item><md-list-item><p translate="HIDEOWNEDITS"></p><md-checkbox ng-model="ctrl.config.hideOwnEdits" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item><md-list-item><p translate="ONELINE"></p><md-checkbox ng-model="ctrl.config.oneline" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item></md-list></div><div flex="50"><md-list layout="column" class="md-padding"><md-list-item><p translate="SUBDIVIDED"></p><md-checkbox ng-model="ctrl.config.subdivided" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item><md-list-item title="{{\'FLAGGEDREVS_TOOLTIP\' | translate}}"><p translate="FLAGGEDREVS_OPTION"></p><md-checkbox ng-model="ctrl.config.flaggedrevsDiff" ng-change="ctrl.resetWatchlist()"></md-checkbox></md-list-item><md-list-item title="{{\'ORES_TOOLTIP\' | translate}}"><p translate="ORES_OPTION"></p><md-checkbox ng-model="ctrl.config.oresDiff" ng-change="ctrl.resetWatchlist()"></md-checkbox></md-list-item><md-list-item><p translate="FLAGS"></p><md-checkbox ng-model="ctrl.config.flagsenable" ng-change="ctrl.saveConfig()"></md-checkbox></md-list-item></md-list></div></div></md-tab></md-tabs></md-whiteframe></div>'), t.put("components/watchlist/edit_oneline.directive.html", '<span class="newpage" ng-if="::event.new" translate="NEWPAGE_FLAG"></span><span class="minoredit" ng-if="::event.minor" translate="MINOREDIT_FLAG"></span><span class="botedit" ng-if="::event.bot" translate="BOTEDIT_FLAG"></span> <a stop-event="" dir="ltr" href="{{::event.projecturl}}/w/index.php?oldid={{::event.old_revid}}&diff={{::event.revid}}" ng-class="::event.titlestyle" target="_blank">{{::event.title}}</a> <span ng-if="event.showDiff">(<a stop-event="" href="{{::event.projecturl}}/w/index.php?title={{::event.title | urlEncode}}&action=history" target="_blank" translate="HISTORY"></a>)</span> <span am-time-ago="event.timestamp"></span> <span class="mw-changeslist-separator">. .</span> <span dir="ltr" ng-class="::event.bytestyle">({{::event.bytes}})</span> <span class="mw-changeslist-separator">. .</span> <span><user></user><span ng-if="::event.parsedcomment" class="comment">(<comment></comment>)</span></span>'), t.put("components/watchlist/edit_twolines.directive.html", '<span class="newpage" ng-if="::event.new" translate="NEWPAGE_FLAG" dir="auto"></span><span class="minoredit" ng-if="::event.minor" translate="MINOREDIT_FLAG" dir="auto"></span><span class="botedit" ng-if="::event.bot" translate="BOTEDIT_FLAG" dir="auto"></span> <a stop-event="" href="{{::event.projecturl}}/w/index.php?oldid={{::event.old_revid}}&diff={{::event.revid}}" ng-class="::event.titlestyle" target="_blank">{{::event.title}}</a> <span ng-if="event.showDiff">(<a stop-event="" href="{{::event.projecturl}}/w/index.php?title={{::event.title | urlEncode}}&action=history" target="_blank" translate="HISTORY"></a>)</span>&#32; <span dir="auto" ng-class="::event.bytestyle">({{::event.bytes}})</span><div><user></user><span dir="auto" ng-if="::event.parsedcomment" class="comment">(<comment></comment>)</span></div>'), t.put("components/watchlist/entry.directive.html", '<div layout="row" layout-align="space-between start"><div ng-if="ctrl.config.oneline" layout="row"><div class="left"><a stop-event="" href="{{::event.projecturl}}/wiki/Special:Watchlist" class="project" title="{{::event.project}}" target="_blank"><img height="16px" ng-src="{{::ctrl.icons[event.projectgroup]}}" alt="{{::event.projectgroup}}"> <span ng-if="::event.projectlang"><span ng-if="!ctrl.config.flagsenable || !ctrl.flagurl(event.projectlang)">{{::event.projectlangname}}</span> <img ng-if="ctrl.config.flagsenable && ctrl.flagurl(event.projectlang)" height="13px" style="margin-bottom: 2px" ng-src="{{::ctrl.flagurl(event.projectlang)}}"></span></a></div><div><watchlist-edit type="oneline" ng-if="::event.type === \'edit\' || event.type === \'new\'"></watchlist-edit><span ng-if="::event.type === \'log\'"><span am-time-ago="event.timestamp"></span> <span class="mw-changeslist-separator">. .</span><watchlist-logevent></watchlist-logevent></span></div></div><div ng-if="!ctrl.config.oneline" layout="row"><div class="left"><div am-time-ago="event.timestamp"></div><a stop-event="" href="{{::event.projecturl}}/wiki/Special:Watchlist" class="project" title="{{::event.project}}" target="_blank"><img height="16px" ng-src="{{::ctrl.icons[event.projectgroup]}}" alt="{{::event.projectgroup}}"> <span ng-if="::event.projectlang"><span ng-if="!ctrl.config.flagsenable || !ctrl.flagurl(event.projectlang)">{{::event.projectlangname}}</span> <img ng-if="ctrl.config.flagsenable && ctrl.flagurl(event.projectlang)" height="13px" style="margin-bottom: 2px" ng-src="{{::ctrl.flagurl(event.projectlang)}}"></span></a></div><div><watchlist-edit type="twolines" ng-if="::event.type === \'edit\' || event.type === \'new\'"></watchlist-edit><watchlist-logevent ng-if="::event.type === \'log\'"></watchlist-logevent></div></div><div layout="column" layout-align="start end"><div stop-event="" layout="row" layout-align="end start"><div stop-event="" layout="row" layout-align="end start" ng-if="event.showDiff && event.type === \'edit\'"><md-button class="md-icon-button" title="{{\'EDIT\' | translate}}" href="{{::event.projecturl}}/w/index.php?title={{::event.title | urlEncode}}&action=edit" target="_blank"><md-icon md-font-library="material-icons">edit</md-icon></md-button><md-button class="md-icon-button" title="{{\'UNDO\' | translate}}" href="{{::event.projecturl}}/w/index.php?title={{::event.title | urlEncode}}&action=edit&undoafter={{::event.old_revid}}&undo={{::event.revid}}" target="_blank"><md-icon md-font-library="material-icons">undo</md-icon></md-button><md-button class="md-icon-button" title="{{\'WATCHLIST_REMOVE\' | translate}}" ng-hide="event.isUnwatched" ng-click="ctrl.watchPage(event, true)"><md-icon md-font-library="material-icons">star</md-icon></md-button><md-button class="md-icon-button" title="{{\'WATCHLIST_ADD\' | translate}}" ng-show="event.isUnwatched" ng-click="ctrl.watchPage(event, false)"><md-icon md-font-library="material-icons">star_border</md-icon></md-button><md-button ng-if="event.stableRevid" class="md-raised md-accent" target="_blank" href="{{::event.projecturl}}/w/index.php?title={{::event.title | urlEncode}}&oldid={{::event.stableRevid}}&diff=cur" translate="PENDING_EDITS"></md-button><md-button class="md-icon-button rightbutton" ng-click="ctrl.clicked(event)" title="{{\'COLLAPSE\' | translate}}"><md-icon md-font-library="material-icons">expand_less</md-icon></md-button></div><md-button ng-show="!event.showDiff && event.type === \'edit\'" class="md-icon-button rightbutton expandbutton" ng-click="ctrl.clicked(event)" title="{{\'SHOW_DIFF\' | translate}}"><md-icon md-font-library="material-icons">expand_more</md-icon></md-button></div><div ng-if="event.showDiff && event.oresProbability"><small class="ores text-muted" translate="ORES_PROBABILITY" translate-values="{probability: event.oresProbability}"></small></div></div></div><table ng-if="event.showDiff && event.diff" class="diff diff-contentalign-left"><colgroup><col class="diff-marker"><col class="diff-content"><col class="diff-marker"><col class="diff-content"></colgroup><tbody ng-bind-html="::event.diff"></tbody></table>'), t.put("components/watchlist/logevent.directive.html", '<span dir="auto" ng-switch="::event.logtype"><span ng-switch-when="delete"><span ng-switch="::event.logaction"><span ng-switch-when="delete" translate="LOGEVENT_DELETE_DELETE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="restore" translate="LOGEVENT_DELETE_RESTORE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="revision" translate="LOGEVENT_DELETE_REVISION" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="protect"><span ng-switch="::event.logaction"><span ng-switch-when="modify" translate="LOGEVENT_PROTECT_MODIFY" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="move_prot" translate="LOGEVENT_PROTECT_MOVE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="protect" translate="LOGEVENT_PROTECT_PROTECT" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="unprotect" translate="LOGEVENT_PROTECT_UNPROTECT" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="move"><span translate="LOGEVENT_MOVE" translate-values="event" translate-interpolation="custom" translate-compile=""></span></span> <span ng-switch-when="block"><span ng-switch="::event.logaction"><span ng-switch-when="block" translate="LOGEVENT_BLOCK_BLOCK" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="reblock" translate="LOGEVENT_BLOCK_REBLOCK" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="unblock" translate="LOGEVENT_BLOCK_UNBLOCK" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="rights"><span ng-switch="::event.logaction"><span ng-switch-when="autopromote" translate="LOGEVENT_RIGHTS_AUTOPROMOTE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="erevoke"><code>{{event}}</code></span> <span ng-switch-when="rights" translate="LOGEVENT_RIGHTS_RIGHTS" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="upload"><span ng-switch="::event.logaction"><span ng-switch-when="overwrite" translate="LOGEVENT_UPLOAD_OVERWRITE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="revert" translate="LOGEVENT_UPLOAD_REVERT" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="upload" translate="LOGEVENT_UPLOAD_UPLOAD" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="import"><span ng-switch="::event.logaction"><span ng-switch-when="interwiki" translate="LOGEVENT_IMPORT_INTERWIKI" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="upload" translate="LOGEVENT_IMPORT_UPLOAD" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="merge"><span translate="LOGEVENT_MERGE" translate-values="event" translate-interpolation="custom" translate-compile=""></span></span> <span ng-switch-when="newusers"><span ng-switch="::event.logaction"><span ng-switch-when="create" translate="LOGEVENT_NEWUSERS_CREATE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="create2" translate="LOGEVENT_NEWUSERS_CREATE2" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="byemail" translate="LOGEVENT_NEWUSERS_BYEMAIL" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="renameuser"><span translate="LOGEVENT_RENAMEUSER" translate-values="event" translate-interpolation="custom" translate-compile=""></span></span> <span ng-switch-when="pagetranslation"><span ng-switch="::event.logaction"><span ng-switch-when="mark" translate="LOGEVENT_TRANSLATION_MARK" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="associate" translate="LOGEVENT_TRANSLATION_ASSOCIATE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="dissociate" translate="LOGEVENT_TRANSLATION_DISSOCIATE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="pagetriage-curation"><span ng-switch="::event.logaction"><span ng-switch-when="reviewed" translate="LOGEVENT_PAGETRIAGE_REVIEWED" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="unreviewed" translate="LOGEVENT_PAGETRIAGE_UNREVIEWED" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="tag" translate="LOGEVENT_PAGETRIAGE_UNREVIEWED" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-when="delete" translate="LOGEVENT_PAGETRIAGE_DELETE" translate-values="event" translate-interpolation="custom" translate-compile=""></span> <span ng-switch-default=""><code>{{event}}</code></span></span></span> <span ng-switch-when="pagetriage-deletion"><span translate="LOGEVENT_PAGETRIAGE_DELETE" translate-values="event" translate-interpolation="custom" translate-compile=""></span></span> <span ng-switch-default=""><code>{{event}}</code></span></span> <span ng-if="::event.parsedcomment" class="comment">(<comment></comment>)</span>'), t.put("components/watchlist/seperated.html", '<div ng-controller="WatchlistCtrl as ctrl" class="md-padding"><div layout="row" layout-align="center center" class="md-padding" ng-if="ctrl.watchlist.loading"><md-whiteframe class="md-whiteframe-z5" ng-class="(ctrl.config.oneline) ? \'whitebox-oneline\' : \'whitebox\'"><md-toolbar class="md-small-tall"><div class="md-toolbar-tools"><h1>{{\'WATCHLIST\' | translate}}</h1></div></md-toolbar><md-list><md-list-item layout="row" layout-align="center center"><md-progress-circular md-mode="indeterminate"></md-progress-circular></md-list-item></md-list></md-whiteframe></div><div ng-repeat="project in ctrl.config.projectsSelected | projectList:ctrl.config" class="md-padding" layout="row" layout-align="center center" ng-if="(ctrl.watchlist.perProject[project] | watchlist:ctrl.config).length"><md-whiteframe class="md-whiteframe-z5" ng-class="(ctrl.config.oneline) ? \'whitebox-oneline\' : \'whitebox\'"><md-toolbar class="md-small-tall"><div class="md-toolbar-tools"><h1>{{project}}</h1></div></md-toolbar><md-list class="watchlist-container"><md-list-item layout="row" class="watchlist" ng-class="ctrl.config.projectColors[event.project]" ng-repeat="event in ctrl.watchlist.perProject[project] | watchlist:ctrl.config track by event.id"><watchlist-entry ng-click="ctrl.clicked(event)" md-ink-ripple=""></watchlist-entry><md-divider></md-divider></md-list-item></md-list></md-whiteframe></div></div>'), t.put("components/watchlist/unified.html", '<div ng-controller="WatchlistCtrl as ctrl" layout="row" layout-align="center center" class="md-padding"><md-whiteframe class="md-whiteframe-z5" ng-class="(ctrl.config.oneline) ? \'whitebox-oneline\' : \'whitebox\'"><md-toolbar class="md-small-tall"><div class="md-toolbar-tools" ng-hide="showSearch"><h1><span translate="WATCHLIST"></span></h1><div flex=""></div><md-button class="md-icon-button" title="{{\'SEARCH_WATCHLIST\' | translate}}" ng-click="showSearch = !showSearch"><md-icon md-font-library="material-icons">search</md-icon></md-button></div><div class="md-toolbar-tools" ng-show="showSearch"><md-input-container flex="flex" md-no-float=""><input type="text" placeholder="{{\'SEARCH_WATCHLIST\' | translate}}" ng-model="searchText" ng-change="ctrl.search(searchText)" ng-model-options="{ debounce: 300 }"></md-input-container></div></md-toolbar><md-list ng-if="ctrl.watchlist.loading"><md-list-item layout="row" layout-align="center center"><md-progress-circular md-mode="indeterminate"></md-progress-circular></md-list-item></md-list><md-list class="watchlist-container" infinite-scroll="ctrl.moreWatchlistEntries()" infinite-scroll-immediate-check="false" infinite-scroll-distance="1"><md-list-item layout="row" class="watchlist" ng-class="ctrl.config.projectColors[event.project]" ng-repeat="event in ctrl.watchlist.active track by event.id"><watchlist-entry ng-click="ctrl.clicked(event)" md-ink-ripple=""></watchlist-entry><md-divider></md-divider></md-list-item></md-list></md-whiteframe></div>')
}]);