/*
    A.I BOT SCRIPT

    Copyright (c) 2014-2018 Balkan Party
    Please do not copy or modify without permission
    from the respected owner(s) and developer(s).

    CURRENT DEVELOPERS: AJDIN (www.ajdin.gq)
                        TONI (warixmods.ga)

    CONTACT: ajdin291@gmail.com
    WEBSITE: http://www.balkan-19.ga/
    UPDATES: http://www.balkan-19.ga/version


    FULL OWNER: Benzie
    ORGINAL LINK: https://github.com/bscBot/source

    INCLUDES: CUSTOM COMMANDS

    ======================================================
                    DO NOT TRY TO EDIT!
    ======================================================

    THIS IS ORGINAL BASIC BOT FOR BALKAN PARTY ROOM ONLY
    WITH CUSTOM COMMANDS.

    ======================================================
*/
/*
    AnimeSrbijaBot BOT SCRIPT

    Custom bot for a Plug.dj community, based on dave1.0 script
    
    This script is modified by Warix3 (Toni Pejić) warixmods.ga
    And AnimeSrbija commands are added by Warix3.
    
    Copyright (c) 2016 Warix3
    Please do not copy or modify without permission
    from the respected owner(s) and developer(s).
    
    Author: Toni Pejić (Warix3)
    Github: Warix3
    Website: warixmods.ga
    E-mail: toni.pejic98@gmail.com
*/
(function() {

    var propMessage;

    var updateProps = function() {
        $.ajax({
            url: 'https://rawgit.com/Ajdin1997/artificial-intelligence/master/props.md',
            cache: false
        }).done(function(response) {
            propMessage = JSON.parse(response);
        });
    };

    updateProps();

    //GLOBAL variables holy3
    var quizMaxpoints = 30;
    var quizState = false;
    var quizBand = "";
    var quizYear = "";
    var quizCountry = "";
    var quizCycle = 1;
    var quizLastUID = null;
    var quizLastScore = 0;
    var quizUsers = [];

    var rssFeeds = [
        ["politika", "https://www.blic.rs/rss/Vesti/Politika", 16, 0],
        ["danas", "https://www.blic.rs/rss/danasnje-vesti", 10, 0],
        ["hronika", "https://www.blic.rs/rss/Vesti/Hronika", 25, 0],
        ["zanimljivosti", "https://www.blic.rs/rss/Slobodno-vreme/Zanimljivosti", 15, 0],
        ["video", "http://www.b92.net/info/rss/video.xml", 25, 0],
        ["zivot", "http://www.b92.net/info/rss/zivot.xml", 10, 0],
        ["lol", "https://eune.leagueoflegends.com/en/rss.xml", 15, 0],
        ["fudbal", "https://sport.blic.rs/rss/Fudbal/Evropski-fudbal", 16, 0]
        /*["facts", "http://uber-facts.com/feed/", 10, 0],
        ["isles", "https://sports.yahoo.com/nhl/teams/nyi/rss.xml", 34, 0]*/
    ];

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem("bBotRoom"));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(bBot.room.autorouletteInterval);
        clearInterval(bBot.room.afkInterval);
        bBot.status = false;
    };

    var storeToStorage = function() {
        localStorage.setItem("bBotsettings", JSON.stringify(bBot.settings));
        localStorage.setItem("bBotRoom", JSON.stringify(bBot.room));
        var bBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: bBot.version
        };
        localStorage.setItem("bBotStorageInfo", JSON.stringify(bBotStorageInfo));

    };

    var subChat = function(chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        chat = chat.substring(4);
        while (chat.startsWith('!') || chat.startsWith('/')) {
            chat = chat.substring(1);
        }
        chat = "/me " + chat;
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get("https://rawgit.com/Ajdin1997/artificial-intelligence/master/Lang/langIndex.json", function(json) {
            var link = bBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[bBot.settings.language.toLowerCase()];
                if (bBot.settings.chatLink !== bBot.chatLink) {
                    link = bBot.settings.chatLink;
                } else {
                    if (typeof link === "undefined") {
                        link = bBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(bBot.chatLink, function(json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };
    //emoji map load
    var loadEmoji = function() {
        $.get("https://raw.githubusercontent.com/Warix3/AnimeSrbijaBot/development/Lang/emojimap.json", function(json) {
            if (json !== null && typeof json !== "undefined") {
                if (typeof json === "string") json = JSON.parse(json);
                bBot.emojimap = json;
                console.log("Emoji map loaded!");
            }
        });
    };
    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem("bBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                bBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem("bBotStorageInfo");
        if (info === null) API.chatLog(bBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("bBotsettings"));
            var room = JSON.parse(localStorage.getItem("bBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(bBot.chat.retrievingdata);
                for (var prop in settings) {
                    bBot.settings[prop] = settings[prop];
                }
                bBot.room.users = room.users;
                bBot.room.afkList = room.afkList;
                bBot.room.historyList = room.historyList;
                bBot.room.mutedUsers = room.mutedUsers;
                //bBot.room.autoskip = room.autoskip;
                bBot.room.roomstats = room.roomstats;
                bBot.room.messages = room.messages;
                bBot.room.queue = room.queue;
                bBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(bBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@bBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        bBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function getRank(name) {
        for (var i = 0; i < API.getUsers().length; ++i) {
            if (API.getUsers()[i].username == name) {
                return API.getUsers()[i].role;
            }
        }
    }

    //Play--------------------------------------------------------------------------------------------------------------------------
    var robotBoyDJ = false
    var robotBoyCurrentDJ = false
    var robotBoyDJLeave = false
    var modAssignedDJ = false
    var robotBoyDJTimeout = false

    function robotBoyDJing() {
        if (API.getMedia() != null) {
            robotBpoyDJ = false

            if (API.getDJ().username == "Dave1.0") {
                robotBoyDJ = true
                robotBoyCurrentDJ = true
            }

            for (var i = 0; i < API.getWaitList().length; i++) {
                if (API.getWaitList()[i].username == "Dave1.0") {
                    robotBoyDJ = true
                    robotBoyCurrentDJ = false
                }
            }
        }
    }

    var robotBoyDJTimeoutFunction = (function() {
        return function() {
            robotBoyDJTimeout = false;
        };
    })();

    var robotDJCheck = (function() {
        return function() {
            robotBoyDJing()

            if (API.getUsers().length < 2) {
                API.djLeave();
                modAssignedDJ = false
                robotBoyDJLeave = false
            }

            if (robotBoyDJ && !robotBoyCurrentDJ && robotBoyDJLeave) {
                API.djLeave();
                modAssignedDJ = false
                robotBoyDJLeave = false
                robotBoyDJTimeout = true
                setTimeout(robotBoyDJTimeoutFunction, 300000)
            }
        };
    })();

    setInterval(robotDJCheck, 10000)


    /*Echos---------------------------------------------------------------------------------------------------------------------------
     var foreverEcho = (function() {
            return function() {                
                var lastEcho = echoHistory2[echoHistory2.length-1]
                if (!lastEcho.includes("://") && getRank(echoHistory1[echoHistory1.length-1]) > 1 && API.getUsers().length > 1) {
                    API.sendChat(lastEcho);
                }
            };
        })();

        var foreverEchoDelay = (function() {
            return function() {                
                setInterval(foreverEcho, 600000)
            };
        })();

        setTimeout(foreverEchoDelay, 300000) */


    //Slots---------------------------------------------------------------------------------------------------------------------------
    function spinSlots() {
        var slotArray = [':lemon:',
            ':tangerine:',
            ':strawberry:',
            ':pineapple:',
            ':apple:',
            ':grapes:',
            ':watermelon:',
            ':cherries:',
            ':green_heart:',
            ':bell:',
            ':gem:',
            ':green_apple:'
        ];
        var slotValue = [1.5,
            2,
            2.5,
            3,
            3.5,
            4,
            4.5,
            5,
            5.5,
            6,
            6.5,
            7
        ];
        var rand = Math.floor(Math.random() * (slotArray.length));
        return [slotArray[rand], slotValue[rand]];
    }

    function spinOutcome(bet) {
        var winnings;
        var outcome1 = spinSlots();
        var outcome2 = spinSlots();
        var outcome3 = spinSlots();

        //Determine Winnings
        if (outcome1[0] == outcome2[0] && outcome1[0] == outcome3[0]) {
            winnings = Math.round(bet * outcome1[1]);
        } else if (outcome1[0] == outcome2[0] && outcome1[0] != outcome3[0]) {
            winnings = Math.round(bet * (.45 * outcome1[1]));
        } else if (outcome1[0] == outcome3[0] && outcome1[0] != outcome2[0]) {
            winnings = Math.round(bet * (.5 * outcome1[1]));
        } else if (outcome2[0] == outcome3[0] && outcome2[0] != outcome1[0]) {
            winnings = Math.round(bet * (.40 * outcome2[1]));
        } else {
            winnings = 0;
        }

        return [outcome1[0], outcome2[0], outcome3[0], winnings];
    }

    //Validate Tokens
    function validateTokens(user) {
        var tokens;

        //Check for existing user tokens
        if (localStorage.getItem(user) == null || localStorage.getItem(user) == "undefined") {
            localStorage.setItem(user, "1");
            tokens = localStorage.getItem(user);
        } else if (localStorage.getItem(user) !== null && localStorage.getItem(user) !== "undefined") {
            tokens = localStorage.getItem(user);
        } else {
            tokens = localStorage.getItem(user);
        }

        return tokens;
    }

    function checkTokens(bet, user) {
        var tokensPreBet = validateTokens(user);
        var tokensPostBet;
        var validBet = true;

        //Adjust amount of tokens
        if (bet > tokensPreBet || bet < 0) {
            validBet = false;
            tokensPostBet = tokensPreBet;
        } else {
            tokensPostBet = tokensPreBet - bet;
        }

        localStorage.setItem(user, tokensPostBet);
        return [tokensPreBet, tokensPostBet, validBet];
    }

    function slotWinnings(winnings, user) {
        var userTokens = parseInt(localStorage.getItem(user)) + winnings;
        if (isNaN(userTokens)) {
            userTokens = winnings;
        }
        localStorage.setItem(user, userTokens);
        return userTokens;
    }

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    function decodeEmoji(s) {

        var wemo = s;
        var first = 0;
        var second = 0;
        var firstFound = false;
        var isIs = false;

        for (var i = 0; i < s.length; i++) {
            if (wemo.charAt(i) == ':' && !firstFound) {
                first = i;
                firstFound = true;
            } else if (wemo.charAt(i) == ':') {
                second = i;
                var possemo = "";
                possemo = bBot.emojimap[wemo.slice(first + 1, second)];
                if (possemo != null) {
                    var possemo2 = ':' + wemo.slice(first + 1, second) + ':';
                    s = s.replace(possemo2, possemo);
                    firstFound = false;
                    s = decodeEmoji(s);
                } else {
                    firstFound = true;
                    first = second;
                }

            }
        }
        return s;
    };

    var botCreator = "Yamatsui";
    var botMaintainer = "BP Team"
    var botCreatorIDs = [4308733, 4308733];
    var suIDs = [4308733, 3749559];

    var bBot = {
        version: "2.2.11",
        status: false,
        name: "S.A.M",
        loggedInID: "3625731",
        scriptLink: "https://rawgit.com/Ajdin1997/artificial-intelligence/master/runbot.js",
        cmdLink: "https://yugoslavia-music.github.io/aitom.html",
        chatLink: "https://rawgit.com/Ajdin1997/artificial-intelligence/master/Lang/cro.json",
        chat: null,
        emojimap: null,
        loadChat: loadChat,
        dbPassword: null,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Tom",
            language: "croatian",
            chatLink: "https://rawgit.com/Ajdin1997/artificial-intelligence/master/Lang/cro.json",
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 90,
            afkRemoval: false,
            maximumDc: 20,
            bouncerPlus: false,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: true,
            voteSkipLimit: 7,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 7,
            autoroulette: true,
            autolottery: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            thorCommand: true,
            thorCooldown: 15,
            skipPosition: 3,
            skipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "Ova pjesma je u history.  "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "Pjesma koju si pustio sadrzi NSFW (slika ili video). "],
                ["unavailable", "Pjesma koju si pustio nije dostupna za neke korisnike. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: "https://yugoslavia-music.github.io/blacklist.html",
            rulesLink: "https://github.com/Bosanka/Pravila/wiki",
            themeLink: null,
            fbLink: "#",
            youtubeLink: "http://bit.ly/1JCermI",
            website: "https://yugoslavia-music.github.io/",
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "!",
            blacklists: {
                OP: "https://plugdj.hosting-plex.ga/_/blacklist/op.json"
            },
            mehAutoBan: true,
            mehAutoBanLimit: 5,
            announceActive: false,
            announceMessage: null,
            announceStartTime: null
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autorouletteInterval: null,
	    autolotteryInterval: null,
            autorouletteFunc: function() {
                if (bBot.status && bBot.settings.autoroulette) {
                    API.sendChat('!roulette');
                }
            },
            autolotteryFunc: function() {
                if (bBot.status && bBot.settings.autolottery) {
                    API.sendChat('!lottery');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    bBot.room.roulette.rouletteStatus = true;
                    bBot.room.roulette.countdown = setTimeout(function() {
                        bBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(bBot.chat.isopen);
                },
                endRoulette: function() {
                    bBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * bBot.room.roulette.participants.length);
                    var winner = bBot.room.roulette.participants[ind];
                    bBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = bBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    /*var rTokens = validateTokens(name);
		     rTokens += 2;*/
                    localStorage.setItem(name, "2");
                    API.sendChat(subChat(bBot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        bBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: [],
            echoHistory1: [],
            echoHistory2: [],
            SlowMode: false,
            SlowModeDuration: 10,

        },

        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
            //balkan points
            this.balkanPoints = 0;
            this.better = null;
            this.offered = 0;
            this.isBetting = false;
            this.toWho = null;
            this.contMehs = 0;
        },
        userUtilities: {
            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = bBot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    if (bBot.room.users[i].id === id) {
                        return bBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    var match = bBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return bBot.room.users[i];
                    }

                }
                return false;
            },
            voteRatio: function(id) {
                var user = bBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;

                if (u.gRole < 3000) return u.role;
                else {
                    switch (u.gRole) {
                        case 3:
                        case 3000:
                            return (1 * (API.ROLE.HOST - API.ROLE.COHOST)) + API.ROLE.HOST;
                        case 5:
                        case 5000:
                            return (2 * (API.ROLE.HOST - API.ROLE.COHOST)) + API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = bBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < bBot.room.queue.id.length; i++) {
                            if (bBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            bBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(bBot.chat.alreadyadding, {
                                position: bBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        bBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            bBot.room.queue.id.unshift(id);
                            bBot.room.queue.position.unshift(pos);
                        } else {
                            bBot.room.queue.id.push(id);
                            bBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(bBot.chat.adding, {
                            name: name,
                            position: bBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = bBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return bBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(bBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return bBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (bBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = bBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(bBot.chat.toolongago, {
                    name: bBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = bBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = bBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(bBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(bBot.chat.valid, {
                    name: bBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                bBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        // BOT DJ START
        botInterfaceUtilities: {
            grab: function() {
                $('#grab').click();
                setTimeout(function() {
                    $('.pop-menu.grab > .menu > ul > li > i.icon-check-purple').parent().mousedown();
                }, 500);
            },
            listJoin: function() {
                el = $('#dj-button');
                // Check that bot is not already djing or waiting.
                if (el.hasClass('is-join') || el.hasClass('is-wait')) {
                    el.click();
                }
            },
            listLeave: function() {
                el = $('#dj-button');
                // Check that the bot is djing or waiting.
                if (el.hasClass('is-quit') || el.hasClass('is-leave')) {
                    el.click();
                    setTimeout(function() {
                        $('#dialog-confirm > .dialog-frame .submit').click();
                    }, 500);
                }
            },
            listToggle: function() {
                el = $('#dj-button');
                el.click();
                // If we are quitting or leaving, handle the confirmation popup.
                if (el.hasClass('is-quit') || el.hasClass('is-leave')) {
                    setTimeout(function() {
                        $('#dialog-confirm > .dialog-frame .submit').click();
                    }, 500);
                }
            },
            meh: function() {
                $('#meh').click();
            },
            togglePlaylistDrawer: function(wait) {
                if ($.isNumeric(wait)) {
                    // If we were passed a wait time, wait.
                    setTimeout(function() {
                        $('#playlist-button').click();
                    }, wait);
                } else {
                    // no wait time, do it now.
                    $('#playlist-button').click();
                }
            },
            showPlaylists: function() {
                bBot.botInterfaceUtilities.togglePlaylistDrawer();
                setTimeout(function() {
                    var playlists = $('#playlist-menu .row').map(function(index) {
                        var lead = '---   ';
                        var trail = '  ---';
                        if ($(this).hasClass('selected') === true) {
                            lead = '==> ';
                            var trail = '  ===';
                        }
                        var id = index + 1;

                        var msg = lead + id + ": " + $(this).children('.name').text() + trail;
                        return msg;
                    }).get();
                    var len = playlists.length;
                    var msg = '';
                    var waittime = 250;
                    for (var i = 0; i < len; i++) {
                        waittime += 250;
                        setTimeout(function(msg) {
                            API.sendChat(msg);
                        }, waittime, playlists[i]);
                    }
                    bBot.botInterfaceUtilities.togglePlaylistDrawer(1500);

                }, 500);
            },
            shufflePlaylist: function() {
                bBot.botInterfaceUtilities.togglePlaylistDrawer();
                setTimeout(function() {
                    $('#playlist-shuffle-button').click();
                    bBot.botInterfaceUtilities.togglePlaylistDrawer(500);
                }, 250);
            },
            switchPlaylist: function(listname) {
                bBot.botInterfaceUtilities.togglePlaylistDrawer();
                if ($.isNumeric(listname)) {
                    setTimeout(function() {
                        $('#playlist-menu .container .row:nth-child(' + listname + ')').mouseup();
                        setTimeout(function() {
                            $('#playlist-menu .container .row:nth-child(' + listname + ')').children('.activate-button').click();
                        }, 500);
                    }, 250);
                } else {
                    setTimeout(function() {
                        el = $('#playlist-menu span:contains("' + listname + '")');
                        if (el.length > 0) {
                            $('#playlist-menu span:contains("' + listname + '")').parent().mouseup();
                            setTimeout(function() {
                                $('#playlist-menu span:contains("' + listname + '")').siblings('.activate-button').click();
                            }, 500);
                        }
                    }, 500);
                }
                bBot.botInterfaceUtilities.togglePlaylistDrawer(500);

                setTimeout(function() {
                    bBot.botInterfaceUtilities.showPlaylists();
                }, 1000)

            },
            woot: function() {
                $('#woot').click();
            }
        },
        // BOT DJ END

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!bBot.roomUtilities.booth.locked);
                    bBot.roomUtilities.booth.locked = false;
                    if (bBot.settings.lockGuard) {
                        bBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                        }, bBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                    clearTimeout(bBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function() {
                if (!bBot.status || !bBot.settings.afkRemoval) return void(0);
                var rank = bBot.roomUtilities.rankToNumber(bBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, bBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = bBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = bBot.userUtilities.getUser(user);
                            if (rank !== null && bBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = bBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = bBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > bBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(bBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(bBot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            bBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(bBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: bBot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                bBot.room.queueable = false;

                if (waitlistlength == 50) {
                    bBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    bBot.room.skippable = false;
                    setTimeout(function() {
                        bBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        bBot.userUtilities.moveUser(id, bBot.settings.skipPosition, false);
                        bBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                bBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (bBot.settings.cycleGuard) {
                        bBot.room.cycleTimer = setTimeout(function() {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, bBot.settings.cycleMaxTime * 60 * 1000);
                    }
                } else {
                    toggle.click();
                    clearTimeout(bBot.room.cycleTimer);
                }

                // TODO: Use API.moderateDJCycle(true/false)
            },
            intervalMessage: function() {
                var interval;
                if (bBot.settings.motdEnabled) interval = bBot.settings.motdInterval;
                else interval = bBot.settings.messageInterval;
                if ((bBot.room.roomstats.songCount % interval) === 0 && bBot.status) {
                    var msg;
                    if (bBot.settings.motdEnabled) {
                        msg = bBot.settings.motd;
                    } else {
                        if (bBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = bBot.room.roomstats.songCount % bBot.settings.intervalMessages.length;
                        msg = bBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in bBot.settings.blacklists) {
                    bBot.room.blacklists[bl] = [];
                    if (typeof bBot.settings.blacklists[bl] === 'function') {
                        bBot.room.blacklists[bl] = bBot.settings.blacklists();
                    } else if (typeof bBot.settings.blacklists[bl] === 'string') {
                        if (bBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(bBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    bBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(bBot.room.newBlacklisted);
                } else {
                    console.log(bBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < bBot.room.newBlacklisted.length; i++) {
                    var track = bBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function(chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();
            chat.message = decodeEmoji(chat.message);

            //Logovi
            /* if (chat.uid != 362573) {
                $.ajaxSetup({
                    async: true
                });
                $.post("http://balkan19.gq/chatlogs/log-edit.php", {
                    type: chat.type,
                    un: chat.un,
                    uid: chat.uid,
                    message: chat.message
                });
            } */

            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === chat.uid) {
                    if (bBot.room.slowMode) {
                        if ((Date.now() - bBot.room.users[i].lastActivity) < (bBot.room.slowModeDuration * 1000)) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        }
                    }
                    bBot.userUtilities.setLastActivity(bBot.room.users[i]);
                    if (bBot.room.users[i].username !== chat.un) {
                        bBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (bBot.chatUtilities.chatFilter(chat)) return void(0);
            if (!bBot.chatUtilities.commandCheck(chat))
                bBot.chatUtilities.action(chat);
		
		/* talk */
		if (chat.message.indexOf("@A.I Tom ") !== -1) {
			var input = chat.message.length + 1;
			 $.getJSON('https://www.cleverbot.com/getreply?key=CC7imeXYjXQ7i0DL2LrG50nOWNw&input=' + input + '.json', function(data) {
                            setTimeout(function() {
                                API.sendChat("@" + chat.un + " : " + data.output);
                            }, 2000)

                        })
		}

		/* talk */
		if (chat.message.indexOf("bot") !== -1) {
			var input2 = chat.message.length + 1;
			 $.getJSON('https://www.cleverbot.com/getreply?key=CC7imeXYjXQ7i0DL2LrG50nOWNw&input=' + input2 + '.json', function(data) {
                            setTimeout(function() {
                                API.sendChat("@" + chat.un + " : " + data.output);
                            }, 2000)

                        })
		}

            /* propMessage */

            if (chat.message.match(/.*[.](\S*).*/)) {
                var regexObj;
                for (var i = 0; i < propMessage.length; ++i) {
                    regexObj = new RegExp(".*[.]" + propMessage[i][0] + ".*");
                    if (chat.message.match(regexObj)) {
                        if (chat.message.match(/@/)) {
                            API.sendChat("/me " + propMessage[i][1].replace("@", "@" + chat.message.replace(/.*[@](\S*).*/, "$1")));
                        } else {
                            API.sendChat("/me " + propMessage[i][1].replace("@", "@" + API.getDJ().username));
                        }
                    }
                }
            }

            // Quiz start
            if (quizState && quizBand != "" && quizYear != "" && quizCountry != "" && chat.uid != bBot.room.currentDJID) {

                var year = new RegExp(quizYear, 'g');
                var country = new RegExp(quizCountry, 'g');

                if (chat.message.match(year) && quizCycle == 1) {
                    API.sendChat("/me @" + chat.un + " Tacno, +1 bod. Odakle " + quizBand + " dolazi/e? (Kao grupa ili Muzicar)");
                    quizLastScore += 1;
                    quizCycle += 1;
                    quizLastUID = chat.uid;
                } else if (chat.message.match(country) && chat.uid == quizLastUID && quizCycle == 2) {
                    API.sendChat("/me @" + chat.un + " Tacno, +1 bod! Bacite kockice kada ste spremni upisivanjem 3 u chat.");
                    quizLastScore += 1;
                    quizCycle += 1;
                } else if (chat.message == "3" && chat.uid == quizLastUID && quizCycle == 3) {
                    quizCycle += 1;
                    var n1 = Math.floor(Math.random() * 6) + 1;
                    var n2 = Math.floor(Math.random() * 6) + 1;
                    var msg = "@" + chat.un + "/me Okrenuo si :game_die: " + n1 + " i:game_die: " + n2;
                    switch (n1 + n2) {
                        case 3:
                            quizLastScore += 10;
                            msg += ", i pogodio svetu 3-icu: +12 bodova! Ka-Ching :moneybag:.";
                            break;
                        case 6:
                            quizLastScore *= 2;
                            msg = msg + ", i duplirao tvoje bodove: +" + quizLastScore + ".";
                            break;
                        case 9:
                            quizLastScore *= 3;
                            msg = msg + ", I utrostručio vaše bodove: +" + quizLastScore + ".";
                            break;
                        case 12:
                            quizLastScore *= 4;
                            msg = msg + ", I učetverostručio vaše bodove: +" + quizLastScore + ".";
                            break;
                        default:
                            msg = msg + ", nije pogodio ni jedan čarobni broj i postigao ukupno " + quizLastScore + " bodova."
                            break;
                    }
                    API.sendChat(msg);

                }
            }
            // END
        },
        eventUserjoin: function(user) {
            var known = false;
            var index = null;
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                bBot.room.users[index].inRoom = true;
                var u = bBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            } else {
                bBot.room.users.push(new bBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < bBot.room.users.length; j++) {
                if (bBot.userUtilities.getUser(bBot.room.users[j]).id === user.id) {
                    bBot.userUtilities.setLastActivity(bBot.room.users[j]);
                    bBot.room.users[j].jointime = Date.now();
                }

            }

            /* if (chat.type == 'mention'){
            API.sendChat(subChat(bBot.chat.mention, {name: chat.un}));
            } */

            if (botCreatorIDs.indexOf(user.id) > -1) {
                console.log(true);
                API.sendChat('[SuperUser] @' + user.username + ' ' + '  je upravo usao.');
            } else if (bBot.settings.welcome && greet) {
                console.log(false);
                console.log(botCreatorIDs);
                welcomeback ?
                    setTimeout(function(user) {
                        API.sendChat(subChat(bBot.chat.welcomeback, {
                            name: user.username
                        }));
                    }, 1 * 1000, user) :
                    setTimeout(function(user) {
                        API.sendChat(subChat(bBot.chat.welcome, {
                            name: user.username
                        }));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function(user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    bBot.userUtilities.updateDC(bBot.room.users[i]);
                    bBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id) {
                        var user = bBot.userUtilities.lookupUser(bBot.room.users[i].id);
                        bBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function(obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        bBot.room.users[i].votes.woot++;
                    } else {
                        bBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();


            if (bBot.settings.voteSkip) {
                if (mehs >= (bBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(bBot.chat.voteskipexceededlimit, {
                        name: dj.username,
                        limit: bBot.settings.voteSkipLimit
                    }));
                    if (bBot.settings.smartSkip && timeLeft > timeElapsed) {
                        bBot.roomUtilities.smartSkip();
                    } else {
                        API.moderateForceSkip();
                    }
                }
            }

            //MehAUTOBAN
            if (bBot.settings.mehAutoBan) {
                var limit = bBot.settings.mehAutoBanLimit;
                var voter = obj.user;
                var vote = obj.vote;

                if (vote == -1) {
                    voter.contMehs++;
                } else {
                    voter.contMehs = 0;
                }

                if (voter.contMehs >= limit) {
                    API.moderateBanUser(voter.id, "Mehao si pjesme " + limit + " puta za redom, šta nije dozvoljeno!", API.BAN.DAY);
                }

            }

        },
        eventCurateupdate: function(obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    bBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function(obj) {
            if (!obj.dj) return;

            //ANNOUNCE:
            if (bBot.settings.announceActive && ((Date.now() - bBot.settings.announceStartTime) >= bBot.settings.announceTime)) {
                API.sendChat("/me " + bBot.settings.announceMessage);
                bBot.settings.announceStartTime = Date.now();
            }
            //POINTS
            if (obj.lastPlay != null) {
                var reward = obj.lastPlay.score.positive + (obj.lastPlay.score.grabs * 3) - obj.lastPlay.score.negative;
                var lastdjplayed = bBot.userUtilities.lookupUser(obj.lastPlay.dj.id);
                lastdjplayed.animePoints += reward;
                API.sendChat("/me # " + lastdjplayed.username + " + " + reward + " osvojenih Yu Poena.");
                $.ajaxSetup({
                    async: true
                });
                $.post("https://plugdj.hosting-plex.ga/_/points/room/data-edit.php", {
                    winnerid: lastdjplayed.id,
                    winnername: lastdjplayed.username,
                    pointswon: reward,
                    dbPassword: bBot.settings.dbPassword
                }, function(data) {
                    if (data.trim() != "PWD_OK") {
                        return API.sendChat("/me Problem sa upisivanjem informacija u bazu podataka!");
                    };
                });
            }


            if (bBot.settings.autowoot) {
                $(".btn-like").click(); // autowoot
            }

            var user = bBot.userUtilities.lookupUser(obj.dj.id)
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    bBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (bBot.settings.songstats) {
                if (typeof bBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                } else {
                    API.sendChat(subChat(bBot.chat.songstatistics, {
                        artist: lastplay.media.author,
                        title: lastplay.media.title,
                        woots: lastplay.score.positive,
                        grabs: lastplay.score.grabs,
                        mehs: lastplay.score.negative
                    }))
                }
            }
            bBot.room.roomstats.totalWoots += lastplay.score.positive;
            bBot.room.roomstats.totalMehs += lastplay.score.negative;
            bBot.room.roomstats.totalCurates += lastplay.score.grabs;
            bBot.room.roomstats.songCount++;
            bBot.roomUtilities.intervalMessage();
            bBot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function() {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in bBot.room.blacklists) {
                    if (bBot.settings.blacklistEnabled) {
                        if (bBot.room.blacklists[bl].indexOf(mid) > -1) {
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.isblacklisted, {
                                name: name,
                                blacklist: bl
                            }));
                            if (bBot.settings.smartSkip) {
                                return bBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function() {
                if (bBot.settings.timeGuard && newMedia.duration > bBot.settings.maximumSongLength * 60 && !bBot.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(bBot.chat.timelimit, {
                        name: name,
                        maxlength: bBot.settings.maximumSongLength
                    }));
                    if (bBot.settings.smartSkip) {
                        return bBot.roomUtilities.smartSkip();
                    } else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function() {
                if (format == 1) {
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet,contentDetails,status&callback=?', function(track) {
                        if (typeof(track.items[0]) === 'undefined' || track.items.status.embeddable === false) {
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.notavailable, {
                                name: name
                            }));
                            if (bBot.settings.smartSkip) {
                                return bBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                } else {
                    var checkSong = SC.get('/tracks/' + cid, function(track) {
                        if (typeof track.title === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.notavailable, {
                                name: name
                            }));
                            if (bBot.settings.smartSkip) {
                                return bBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (bBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function() {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            bBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(bBot.chat.songknown, {
                                name: name
                            }));
                            if (bBot.settings.smartSkip) {
                                return bBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        bBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(bBot.chat.permissionownsong, {
                    name: user.username
                }));
                user.ownSong = false;
            }
            clearTimeout(bBot.room.autoskipTimer);
            if (bBot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                bBot.room.autoskipTimer = setTimeout(function() {
                    if (!API.getMedia()) return;

                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();

            // Quiz - request info and ask active question
            if (quizState) {

                //Add personal score and check if he/she wins
                if (quizBand != "" && quizLastScore != 0) {
                    if (quizUsers.length > 0) {
                        for (var i = 0; i < quizUsers.length; i++) {
                            if (quizUsers[i][0] == quizLastUID) {
                                quizUsers[i][2] += quizLastScore;
                                if (quizUsers[i][2] >= parseInt(quizMaxpoints, 10)) {
                                    API.sendChat("@" + quizUsers[i][1] + " Pobjedio si! Cestitam, Bit ces zapamcen vjekovima. Nije li to najbolja cijena koju možete osvojiti? ^^");
                                    quizState = false;
                                } else {
                                    API.sendChat("@" + quizUsers[i][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[i][2] + " / Poena preostalo: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[i][2], 10)).toString());
                                }
                                break;
                            } else if (i == quizUsers.length - 1) {
                                quizUsers.push([quizLastUID, bBot.userUtilities.lookupUser(quizLastUID).username, quizLastScore]);
                                API.sendChat("@" + quizUsers[i][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[i][2] + " / Poena preostalo: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[i][2], 10)).toString());
                            }
                        }
                    } else {
                        quizUsers.push([quizLastUID, bBot.userUtilities.lookupUser(quizLastUID).username, quizLastScore]);
                        API.sendChat("@" + quizUsers[0][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[0][2] + " / Bodova preostalo: " + (parseInt(quizMaxpoints, 10) - parseInt(quizUsers[0][2], 10)).toString());
                    }
                }

                //Reset variables
                quizCycle = 1;
                quizLastScore = 0;

                if (quizState) {

                    //Load current song stats
                    console.log(newMedia.author + " " + newMedia.duration);
                    var XMLsource = 'http://musicbrainz.org/ws/2/artist/?query=artist:' + newMedia.author.replace(/ /g, "%20") + '&limit=1';

                    simpleAJAXLib = {

                        init: function() {
                            this.fetchJSON(XMLsource);
                        },

                        fetchJSON: function(url) {
                            var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                            var yql = 'select * from xml where url="' + url + '"';
                            var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                            document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                        },

                        jsTag: function(url) {
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', url);
                            return script;
                        },

                        display: function(results) {
                            try {
                                if (results.query.results.metadata["artist-list"].count > 1) {
                                    quizCountry = results.query.results.metadata["artist-list"].artist[0].area.name;
                                    quizYear = results.query.results.metadata["artist-list"].artist[0]["life-span"].begin.match(/\d{4}/);
                                    quizBand = results.query.results.metadata["artist-list"].artist[0].name;
                                } else {
                                    quizCountry = results.query.results.metadata["artist-list"].artist.area.name;
                                    quizYear = results.query.results.metadata["artist-list"].artist["life-span"].begin.match(/\d{4}/);
                                    quizBand = results.query.results.metadata["artist-list"].artist.name;
                                }
                                if (quizCountry != "" && quizYear != "") {
                                    console.log(quizCountry + " " + quizYear);
                                    API.sendChat("/me @djs [#kviz] U kojoj godini je " + quizBand + " rodjen/a. (Osnovani ako je u pitanju grupa.)");
                                }
                            } catch (e) {
                                console.log("Error: " + e);
                                console.log("Žao nam je, čini se da musicbrainz ne prepoznaje ovaj bend ili umjetnika. Nastavit ćemo za vrijeme sljedeće pjesme.");
                                console.log("country or year not known");
                            }
                        }
                    }
                    simpleAJAXLib.init();
                }

            }
            // END
        },

        eventWaitlistupdate: function(users) {
            if (users.length < 50) {
                if (bBot.room.queue.id.length > 0 && bBot.room.queueable) {
                    bBot.room.queueable = false;
                    setTimeout(function() {
                        bBot.room.queueable = true;
                    }, 500);
                    bBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function() {
                            id = bBot.room.queue.id.splice(0, 1)[0];
                            pos = bBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function(id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    bBot.room.queueing--;
                                    if (bBot.room.queue.id.length === 0) setTimeout(function() {
                                        bBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + bBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = bBot.userUtilities.lookupUser(users[i].id);
                bBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function(chat) {
            if (!bBot.settings.filterChat) return false;
            if (bBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(bBot.chat.caps, {
                    name: chat.un
                }));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(bBot.chat.askskip, {
                    name: chat.un
                }));
                return true;
            }
            for (var j = 0; j < bBot.chatUtilities.spam.length; j++) {
                if (msg === bBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(bBot.chat.spam, {
                        name: chat.un
                    }));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function(chat) {
                var msg = chat.message;
                var perm = bBot.userUtilities.getPermission(chat.uid);
                var user = bBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < bBot.room.mutedUsers.length; i++) {
                    if (bBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (bBot.settings.lockdownEnabled) {
                    if (perm === API.ROLE.NONE) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (bBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (bBot.settings.cmdDeletion && msg.startsWith(bBot.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(bBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf("[LDO]") !== -1) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                }
                if (msg.indexOf("Dobrodosli") !== -1) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                }
                if (msg.indexOf("osvojenih") !== -1) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                }
                if (msg == "ispricaj mi vic" || msg == "Ispricaj mi vic") {
                    var jokesMsg = [
                        "Danas sam pola sata na fejsu brisao prijatelje muškarce koje prvi put vidim, dok na kraju nisam ukapirao da sam upao na ženin profil...",
                        "Juče mi Ciganka gleda u dlan i kaže mi da sam lep. Dao sam joj 200 dinara da kupi sebi naočare...",
                        "Ako Deda Mraz, dok mu sedite u krilu, ne govori: -Hohohoho-, nego -Ohohohoh-, odmah ustanite!",
                        "Zasto crnogorci dolaze u Srbiju? - Zato sto su culi da tamo nema posla.",
                        "Kako se crnogorac udvara devojci? - Ja se tebi svidjam,a ti meni?",
                        "U takmicenju bacanja cekica udalj pobjedi Crnogorac. Sta mislite zasto? Pa alat sto dalje od njega.",
                        "Šta viče Saša Matić na rodjendanu svoje dece? - Bežte deco, tata seče tortu !",
                        "Kad umiru sećeraši? - Kad im je najsladje.",
                        "Sta kaze sasa matic posle koncerta? Ludi bili ste mrak!!",
                        "Idu dva pedofila ulicom i jedan ugleda curicu od 7 godina pa kaze: -Kakva je ovo dobra picka nekad bila.",
                        "Pitaju cigu sta slusa od muzike a on ce na to: Sve zivo, i Toseta.",
                        "Zašto crnac nosi bijele rukavice dok jede čokoladu? - Da ne pojede prste.",
                        "Napravi hitler staklenu zgradu u nju stavi jevreje i kaze koga vidim na prozoru ubicu ga.",
                        "Koja je omiljena boja Sasi Maticu: - Crna.",
                        "Sta je sreca u nesreci? - Kad te udari vozilo hitne pomoci.",
                        "Šta dobijemo kad stavimo babu u vrelu vodu? - Čaj od nane!",
                        "Sasa Matic ide na razgovor u 2 oka.",
                        "Šta kaže pedofil kada udje u vrtić? -E, ovo je zemlja mojih snova",
                        "Sta plavusa radi na dnu mora? - Igra se sa kitom!!",
                        "Koja je razlika izmedju Sljive i Zene? - Sljiva prvo rodi pa je otreses a zenu prvo otreses pa rodi.",
                        "Kako se na španskom kaže švaler? - Karo De Stigo.",
                        "Kako Ivica naziva divlji seks? -Bitka na Marici.",
                        "Sta je brak? - Jedini rat u kojem spavamo sa neprijateljem!",
                        "Sta se desi kada popijes viagru i apaurin? -Jebe ti se, al ti se ne da...",
                        "E Mujo ovo ti je zivot ! Pesak , sunce , voda ... .Ajde bre Haso neseri , vec puni tu mesalicu !",
                        "Spava Mujo I probudi ga Fata: - Mujo, budi se, nisi popio tabletu za spavanje!",
                        "Toliko je hladno da Šaban Šaulić opet nosi periku.",
                        "Kako se terorista udvara devojci? - Hoćeš da ti Skinem onaj avion?",
                        "Najtužniji vic na svetu: Plavuša se ofarbala, Mujo i Haso su umrli, a perica završio školu.",
                        "Sve što imam sam ukrao , samo školsku diplomu i ispit za auto sam kupio!",
                        "Svi voze kupljeni auto samo neda ukraden!",
                        "Kolika je recesija u Bosni da su iz Horoskopa sklonili posao.",
                        "Tek kad mi je se komarac spustio na jaja sam shvatio da se stvari ne rješavaju nasiljem.",
                        "Мoja žena je najbolji golman... Sve mi brani.",
                        "Lopovi, ne kradite! Drzava ne voli kunkurenciju.",
                        "Devojka mi kaže da će me ostaviti, jer više volim poker nego nju. -Mislim da blefira.",
                        "Sta Je Brze Od Svetlosti?? - Baba kad Vidi prazno mesto u Autobusu!",
                        "Kako se zove najsmesnij kinez -Smaj Li",
                        "OGLAS: -Prodajem Jeftina kola ! Pozurite dok Jefta nije dosao...",
                        "Ulazi Andjelina u pekaru i kaze: - Daj meni viršlu a Bredu Pitu",
                        "Sve je manje pametnih ljudi na svetu.!. -Tesla- umro, Einstein- Umro, A Ni ja se ne osećam baš najbolje!",
                        "Toliko si ruzan/na da kada stavis slike na komp antivirus ih sam obrise..",
                        "Šta je vrhunac krize? Kad uđeš u kinesku radnju i kažeš: - Ništa ništa, samo razgledam."
                    ];
                    API.sendChat("@" + chat.un + " " + jokesMsg[Math.floor(Math.random() * jokesMsg.length)]);
                }

                if (msg == "tell me a joke" || msg == "Tell me a joke") {
                    $.getJSON('https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_joke', function(data) {
                        API.sendChat("/em @" + chat.un + " : " + data.setup);
                        setTimeout(function() {
                            API.sendChat("/em @" + chat.un + " : " + data.punchline);
                        }, 5000);

                    })
                }
                if (msg == "tell me a joke about chuck" || msg == "Tell me a joke about chuck") {
                    $.getJSON('https://api.chucknorris.io/jokes/random', function(data) {
                        API.sendChat("/em @" + chat.un + " : " + data.value);
                    })
                }
                if (msg == "Kako?" || msg == "Kako") {
                    var KAKMsg = ["Tako!", "Onako!", "St/a te briga!", "Nikako.", "Fino!!", "Bolje da ne znas!!", "Pitaj Merimu!!"];
                    API.sendChat("@" + chat.un + " " + KAKMsg[Math.floor(Math.random() * KAKMsg.length)]);
                }
                if (msg == "Gdje" || msg == "Gdje?") {
                    var GDJMsg = ["Kod ivana!", "Na kaucu?", "Kod tetke mi ha?", "U sobi mozda?", "Kod ivana hu", "U pm!!"];
                    API.sendChat("@" + chat.un + " " + GDJMsg[Math.floor(Math.random() * GDJMsg.length)]);
                }
                if (msg == "Kada" || msg == "Kada?") {
                    var KDMsg = ["Ka/d god hoces!", "Nikad!", "Sutra!", "Sta te briga.", "Kad hoces!!", "Vidjet cemo!!", "Zvat cu te", "Evo maloprije ka/d se Meri tusirala!!"];
                    API.sendChat("@" + chat.un + " " + KDMsg[Math.floor(Math.random() * KDMsg.length)]);
                }
                if (msg == "S kim" || msg == "S kim?") {
                    var SKIMsg = ["S Tetkom?", "Sa Ivanom?", "Sa Eminom?", "Samnom?"];
                    API.sendChat("@" + chat.un + " " + SKIMsg[Math.floor(Math.random() * SKIMsg.length)]);
                }
                if (msg == "Sta" || msg == "Sta?") {
                    var STMsg = ["Nist/a!!", "Glava ti ko pišta!!!", "St/ap za pecanje ha", "St/a te briga"];
                    API.sendChat("@" + chat.un + " " + STMsg[Math.floor(Math.random() * STMsg.length)]);
                }
                if (msg == "Sto?" || msg == "Sto") {
                    var ZASMsg = ["Zato!!", "Zato jer ja kazem tako!!", "Jer tako ivan kaze!!", "Jer sam ja pametan ti nisi!!"];
                    API.sendChat("@" + chat.un + " " + ZASMsg[Math.floor(Math.random() * ZASMsg.length)]);
                }
                /* BEGIN NOW
		    if (msg == "@A.I Tom volis li me" || msg == "@A.I Tom volis li me?" || msg == "@A.I Tom Volis li me" || msg == "@A.I Tom Volis li me?" || msg == "@A.I Tom volim te" || msg == "@A.I Tom Volim te") {
        var vtpMsg = ["Ne volim te!!", "Najvisee!! :*", "Najvise na svijetu!! <3", "Volim te!!","Nisam tu...","Naravno!!","Srce moje.!!","Moje nebo <3","Ne poznajem te....","NE!!","Sanjaj srce","Do neba i nazad."];
        setTimeout(function() {
            API.sendChat("@" + chat.un + " " + vtpMsg[Math.floor(Math.random() * vtpMsg.length)]);
        }, 3000);
    } */
                /*if (msg.indexOf("@A.I Tom ") !== -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(bBot.chat.mention, {
                        name: chat.un
                    }));
                    return true;
                }*/
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = bBot.chat.roulettejoin;
                var rlLeaveChat = bBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === bBot.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function(chat) {
                var cmd;
                if (chat.message.charAt(0) === bBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    } else cmd = chat.message.substring(0, space);
                } else return false;
                var userPerm = bBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== bBot.settings.commandLiteral + 'join' && chat.message !== bBot.settings.commandLiteral + "leave") {
                    if (userPerm === API.ROLE.NONE && !bBot.room.usercommand) return void(0);
                    if (!bBot.room.allcommand) return void(0);
                }
                if (chat.message === bBot.settings.commandLiteral + 'eta' && bBot.settings.etaRestriction) {
                    if (userPerm < API.ROLE.BOUNCER) {
                        var u = bBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        } else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in bBot.commands) {
                    var cmdCall = bBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (bBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            bBot.commands[comm].functionality(chat, bBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === API.ROLE.NONE) {
                    bBot.room.usercommand = false;
                    setTimeout(function() {
                        bBot.room.usercommand = true;
                    }, bBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (bBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //bBot.room.allcommand = false;
                    //setTimeout(function () {
                    bBot.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function(chat) {
                var user = bBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < bBot.room.users.length; j++) {
                        if (bBot.userUtilities.getUser(bBot.room.users[j]).id === chat.uid) {
                            bBot.userUtilities.setLastActivity(bBot.room.users[j]);
                        }

                    }
                }
                bBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function() {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function() {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function() {
            if (window.location.href.indexOf("yugoslavia-balkan-music") > -1) {
                //Login code start

                retrieveSettings();
                retrieveFromStorage();

                if (bBot.settings.dbPassword == null) {
                    checkPassword();
                }

                function checkPassword() {
                    var dbPassword1 = prompt("Unesite lozinku od baze podataka: ");
                    $.ajaxSetup({
                        async: false
                    });
                    $.post("https://plugdj.hosting-plex.ga/_/points/room/data-edit.php", {
                        dbPassword: dbPassword1
                    }, function(data, status) {
                        console.log(data);
                        var str = data;
                        if (String(str).trim() === "PWD_OK") {
                            bBot.settings.dbPassword = dbPassword1;
                        } else {
                            alert("Netočna lozinka, pokušajte ponovo!");
                            checkPassword();
                        }
                    });
                }
                //PUT ALL OF STARTUP CODE INSIDE OF THIS IF EXECUTION CODE


                var u = API.getUser();
                if (bBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(bBot.chat.greyuser);
                if (bBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(bBot.chat.bouncer);
                bBot.connectAPI();
                API.moderateDeleteChat = function(cid) {
                    $.ajax({
                        url: "https://plug.dj/_/chat/" + cid,
                        type: "DELETE"
                    })
                };

                bBot.room.name = window.location.pathname;
                var Check;

                //console.log(bBot.room.name);

                var detect = function() {
                    if (bBot.room.name != window.location.pathname) {
                        console.log("Killing bot after room change.");
                        storeToStorage();
                        bBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                        if (bBot.settings.roomLock) {
                            window.location = 'https://plug.dj' + bBot.room.name;
                        } else {
                            clearInterval(Check);
                        }
                    }
                };

                Check = setInterval(function() {
                    detect()
                }, 2000);

                window.bot = bBot;
                bBot.roomUtilities.updateBlacklists();
                setInterval(bBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
                bBot.getNewBlacklistedSongs = bBot.roomUtilities.exportNewBlacklistedSongs;
                bBot.logNewBlacklistedSongs = bBot.roomUtilities.logNewBlacklistedSongs;
                if (bBot.room.roomstats.launchTime === null) {
                    bBot.room.roomstats.launchTime = Date.now();
                }

                for (var j = 0; j < bBot.room.users.length; j++) {
                    bBot.room.users[j].inRoom = false;
                }
                var userlist = API.getUsers();
                for (var i = 0; i < userlist.length; i++) {
                    var known = false;
                    var ind = null;
                    for (var j = 0; j < bBot.room.users.length; j++) {
                        if (bBot.room.users[j].id === userlist[i].id) {
                            known = true;
                            ind = j;
                        }
                    }
                    if (known) {
                        bBot.room.users[ind].inRoom = true;
                    } else {
                        bBot.room.users.push(new bBot.User(userlist[i].id, userlist[i].username));
                        ind = bBot.room.users.length - 1;
                    }
                    var wlIndex = API.getWaitListPosition(bBot.room.users[ind].id) + 1;
                    bBot.userUtilities.updatePosition(bBot.room.users[ind], wlIndex);
                }
                bBot.room.afkInterval = setInterval(function() {
                    bBot.roomUtilities.afkCheck()
                }, 10 * 1000);
                bBot.room.autorouletteInterval = setInterval(function() {
                    bBot.room.autorouletteFunc();
                }, 90 * 60 * 1000);
                bBot.room.autolotteryInterval = setInterval(function() {
                    bBot.room.autolotteryFunc();
                }, 21600000);
                bBot.loggedInID = API.getUser().id;
                bBot.status = true;
                API.sendChat('/cap ' + bBot.settings.startupCap);
                API.setVolume(bBot.settings.startupVolume);
                if (bBot.settings.autowoot) {
                    $(".btn-like").click();
                }
                if (bBot.settings.startupEmoji) {
                    var emojibuttonoff = $(".icon-emoji-off");
                    if (emojibuttonoff.length > 0) {
                        emojibuttonoff[0].click();
                    }
                    API.chatLog(':smile: Emojis enabled.');
                } else {
                    var emojibuttonon = $(".icon-emoji-on");
                    if (emojibuttonon.length > 0) {
                        emojibuttonon[0].click();
                    }
                    API.chatLog('Emojis disabled.');
                }
                API.chatLog('Avatars capped at ' + bBot.settings.startupCap);
                API.chatLog('Volume set to ' + bBot.settings.startupVolume);
                loadChat(API.sendChat(subChat(bBot.chat.online, {
                    botname: bBot.settings.botName,
                    version: bBot.version
                })));
                loadEmoji();
            } else {
                confirm("Skriptu je moguce pokretati samo na: Yugoslavia Balkan Music");
            }
            //END

        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = bBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2 * (API.ROLE.HOST - API.ROLE.COHOST)) + API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1 * (API.ROLE.HOST - API.ROLE.COHOST)) + API.ROLE.HOST;
                        break;
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (bBot.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'su':
                        if (suIDs.indexOf(id) > -1) {
                            minPerm = API.ROLE.NONE;
                        } else {
                            minPerm = API.ROLE.COHOST;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !bBot.commands.executable(this.rank, chat) ) return void (0);
                                else{

                                }
                        }
                },
             **/


            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(bBot.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < bBot.room.users.length; i++) {
                            userTime = bBot.userUtilities.getLastActivity(bBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(bBot.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (bBot.room.roomevent) {
                                    bBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolimitspecified, {
                            name: chat.un
                        }));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            bBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(bBot.chat.maximumafktimeset, {
                                name: chat.un,
                                time: bBot.settings.maximumAfk
                            }));
                        } else API.sendChat(subChat(bBot.chat.invalidlimitspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.afkRemoval) {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            clearInterval(bBot.room.afkInterval);
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.afkremoval
                            }));
                        } else {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            bBot.room.afkInterval = setInterval(function() {
                                bBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.afkremoval
                            }));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        bBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(bBot.chat.afkstatusreset, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var lastActive = bBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = bBot.roomUtilities.msToStr(inactivity);

                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline) {
                            API.sendChat(subChat(bBot.chat.inactivelonger, {
                                botname: bBot.settings.botName,
                                name: chat.un,
                                username: name
                            }));
                        } else {
                            API.sendChat(subChat(bBot.chat.inactivefor, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                        }
                    }
                }
            },

            autorouletteCommand: {
                command: 'aroulette',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.autoroulette) {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.autoroulette
                            }));
                        } else {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.autoroulette
                            }));
                        }

                    }
                }
            },

            alotteryCommand: {
                command: 'alottery',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.autolottery) {
                            bBot.settings.autolottery = !bBot.settings.autolottery;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.autolottery
                            }));
                        } else {
                            bBot.settings.autolottery = !bBot.settings.autolottery;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.autolottery
                            }));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.autoskip) {
                            bBot.settings.autoskip = !bBot.settings.autoskip;
                            clearTimeout(bBot.room.autoskipTimer);
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.autoskip
                            }));
                        } else {
                            bBot.settings.autoskip = !bBot.settings.autoskip;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(bBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(bBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: '8ball',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * bBot.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(bBot.chat.ball, {
                            name: chat.un,
                            question: argument,
                        }));
                        setTimeout(function() {
                            API.sendChat(subChat(bBot.chat.ballanswer, {
                                name: chat.un,
                                response: bBot.chat.balls[randomBall]
                            }));
                        }, 5000)
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolistspecified, {
                            name: chat.un
                        }));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof bBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(bBot.chat.invalidlistspecified, {
                            name: chat.un
                        }));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            bBot.room.newBlacklisted.push(track);
                            bBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(bBot.chat.newblacklisted, {
                                name: chat.un,
                                blacklist: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            }));
                            if (bBot.settings.smartSkip && timeLeft > timeElapsed) {
                                bBot.roomUtilities.smartSkip();
                            } else {
                                API.moderateForceSkip();
                            }
                            if (typeof bBot.room.newBlacklistedSongFunction === 'function') {
                                bBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(bBot.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (bBot.settings.bouncerPlus) {
                            bBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!bBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = bBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    bBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(bBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(bBot.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentbotname, {
                            botname: bBot.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            bBot.settings.botName = argument;
                            API.sendChat(subChat(bBot.chat.botnameset, {
                                botName: bBot.settings.botName
                            }));
                        }
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(bBot.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.commandslink, {
                            botname: bBot.settings.botName,
                            link: bBot.cmdLink
                        }));
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.cmdDeletion) {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.cmddeletion
                            }));
                        } else {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.cmddeletion
                            }));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * bBot.chat.cookies.length);
                    return bBot.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(bBot.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.cycleGuard) {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.cycleguard
                            }));
                        } else {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.cycleguard
                            }));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            bBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(bBot.chat.cycleguardtime, {
                                name: chat.un,
                                time: bBot.settings.maximumCycletime
                            }));
                        } else return API.sendChat(subChat(bBot.chat.invalidtime, {
                            name: chat.un
                        }));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = bBot.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(bBot.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = bBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < bBot.room.chatMessages.length; i++) {
                            if (bBot.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(bBot.room.chatMessages[i][0]);
                                bBot.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(bBot.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(bBot.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            discordCommand: {
                command: 'discord',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://balkan-19.ga/invite';
                        API.sendChat(subChat(bBot.chat.discordinvite, {
                            link: link
                        }));
                    }
                }
            },

            versionCommand: {
                command: 'version',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'https://yugoslavia-music.github.io/pages/version.html';
                        API.sendChat(subChat(bBot.chat.latestversion, {
                            link: link
                        }));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = bBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'Var venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable InglÃ©s.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaÃ®t.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'ProszÄ mÃ³wiÄ po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale Ingles.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosÃ­m.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosÃ­m anglicky.';
                                break;
                            case 'sr':
                                ch += '????? ???, ???????? ????????.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = bBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(bBot.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(bBot.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(bBot.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = bBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(bBot.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.fbLink === "string")
                            API.sendChat(subChat(bBot.chat.facebook, {
                                name: chat.un,
                                link: bBot.settings.fbLink
                            }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.filterChat) {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.chatfilter
                            }));
                        } else {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        bBot.room.skippable = false;
                        setTimeout(function() {
                            bBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(bBot.chat.ghosting, {
                                name1: chat.un,
                                name2: name
                            }));
                        } else API.sendChat(subChat(bBot.chat.notghosting, {
                            name1: chat.un,
                            name2: name
                        }));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func) {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g, "+");
                            var commatag = tag.replace(/ /g, ", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgiftags, {
                                        name: chat.un,
                                        id: id,
                                        tags: commatag
                                    }));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgiftags, {
                                        name: chat.un,
                                        tags: commatag
                                    }));
                                }
                            });
                        } else {
                            function get_random_id(api_key, func) {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?", {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgifrandom, {
                                        name: chat.un,
                                        id: id
                                    }));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgifrandom, {
                                        name: chat.un
                                    }));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(bBot.chat.starterhelp, {
                            link: link
                        }));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.historySkip) {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.historyskip
                            }));
                        } else {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var id = chat.uid;
                        var name = chat.un;
                        var isDj;
                        if (typeof API.getDJ() != "undefined") {
                            isDj = API.getDJ().id == id ? true : false;
                        } else {
                            isDj = false;
                        }
                        var djlist = API.getWaitList();
                        if (isDj === true)
                            API.sendChat("@" + name + " Trenutni DJ ne moze da ucestvuje!!.");
                        if (isDj === false)
                            if (bBot.room.roulette.rouletteStatus && bBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                                bBot.room.roulette.participants.push(chat.uid);
                                API.sendChat(subChat(bBot.chat.roulettejoin, {
                                    name: chat.un
                                }));
                            }
                    }
                }
            },

            /* joinCommand: {
                 command: 'join',
                 rank: 'user',
                 type: 'exact',
                 functionality: function(chat, cmd) {
                     if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                     if (!bBot.commands.executable(this.rank, chat)) return void(0);
                     else {
                         if (bBot.room.roulette.rouletteStatus && bBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                             bBot.room.roulette.participants.push(chat.uid);
                             API.sendChat(subChat(bBot.chat.roulettejoin, {
                                 name: chat.un
                             }));
                         }
                     }
                 }
             }, */

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = bBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = bBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(bBot.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = bBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = bBot.userUtilities.getPermission(chat.uid);
                        var permTokick = bBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(bBot.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(bBot.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(bBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            stopCommand: {
                command: 'stop',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        API.sendChat(bBot.chat.kill);
                        bBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentlang, {
                            language: bBot.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Ajdin1997/artificial-intelligence/master/Lang/langIndex.json", function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(bBot.chat.langerror, {
                                    link: "http://git.io/vJ9nI"
                                }));
                            } else {
                                bBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(bBot.chat.langset, {
                                    language: bBot.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = bBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            bBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(bBot.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = bBot.userUtilities.lookupUser(chat.uid);
                        var perm = bBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= API.ROLE.DJ || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "http://youtu.be/" + media.cid;
                                API.sendChat(subChat(bBot.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(bBot.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = bBot.settings.lockdownEnabled;
                        bBot.settings.lockdownEnabled = !temp;
                        if (bBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.lockdown
                            }));
                        } else return API.sendChat(subChat(bBot.chat.toggleoff, {
                            name: chat.un,
                            'function': bBot.chat.lockdown
                        }));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.lockGuard) {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.lockguard
                            }));
                        } else {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.lockguard
                            }));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            bBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(bBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    setTimeout(function() {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function() {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < bBot.settings.lockskipReasons.length; i++) {
                                var r = bBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += bBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(bBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function() {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function() {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            bBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(bBot.chat.lockguardtime, {
                                name: chat.un,
                                time: bBot.settings.maximumLocktime
                            }));
                        } else return API.sendChat(subChat(bBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.logout, {
                            name: chat.un,
                            botname: bBot.settings.botName
                        }));
                        setTimeout(function() {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            bBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(bBot.chat.maxlengthtime, {
                                name: chat.un,
                                time: bBot.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(bBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + bBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.motdEnabled) bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            bBot.settings.motd = argument;
                            API.sendChat(subChat(bBot.chat.motdset, {
                                msg: bBot.settings.motd
                            }));
                        } else {
                            bBot.settings.motdInterval = argument;
                            API.sendChat(subChat(bBot.chat.motdintervalset, {
                                interval: bBot.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(bBot.chat.move, {
                                name: chat.un
                            }));
                            bBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(bBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permUser = bBot.userUtilities.getPermission(user.id);
                        if (permUser == API.ROLE.NONE) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(bBot.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(bBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(bBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(bBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(bBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(bBot.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.opLink === "string")
                            return API.sendChat(subChat(bBot.chat.oplist, {
                                name: chat.un,
                                link: bBot.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.pong, {
                            name: chat.un
                        }));
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        bBot.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(bBot.chat.reload);
                        storeToStorage();
                        bBot.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(bBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.etaRestriction) {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.etarestriction
                            }));
                        } else {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.etarestriction
                            }));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!bBot.room.roulette.rouletteStatus) {
                            bBot.room.roulette.startRoulette();
                        }
                    }
                }
            },
            
		lotteryCommand: {
                command: ['lottery'],
                rank: 'su',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
					users = API.getUsers();
					var randomPerson = Math.floor(Math.random() * users[0].id);
					var randomPos = Math.floor((Math.random() * API.getWaitList().length) + 1);
					API.sendChat("# Otvorena je lutrija, za nekoliko minuta napisat cu dobitni tiket. Vaš tiket predstavlja vas ID, i ukoliko je odabran, dobijate jednu od nagrada. Svaka prevara ce biti kaznjena zabranom ucesca u lutriji.");
      var lotteryPrizes = Math.floor(Math.random() * 10);
	  setTimeout(function() {
      switch (lotteryPrizes) {
        case 0:
          API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio DJ mjesto.");
		  bBot.userUtilities.moveUser(randomPerson, 1, false);
          break;
        case 1:
          API.sendChat("Lutrija je zavrsena, Tiket ID : " + randomPerson + " je upravo osvojio 1000 plug poena. Molim te da uslikas ovu poruku kao dokaz da bi ti admin mogao poslati poene.");
          break;
        case 2:
          API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio/la prvo mjesto na DJ listi.");
          break;
        case 3:
          API.sendChat("Lutrija je zavrsena, Tiket ID : " + randomPerson + " je upravo osvojio 2000 plug poena. Molim te da uslikas ovu poruku kao dokaz da bi ti admin mogao poslati poene.");
          break;
        case 4:
          API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio DJ mjesto.");
          break;
        case 5:
          API.sendChat("Lutrija je zavrsena, Tiket ID : " + randomPerson + " je upravo osvojio 3000 plug poena. Molim te da uslikas ovu poruku kao dokaz da bi ti admin mogao poslati poene.");
          break;
        case 6:
         API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio DJ mjesto.");
          break;
        case 7:
          API.sendChat("Lutrija je zavrsena, Tiket ID : " + randomPerson + " je upravo osvojio 1000 plug poena. Molim te da uslikas ovu poruku kao dokaz da bi ti admin mogao poslati poene.");
          break;
        case 8:
          API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio/la prvo mjestu na DJ listi.");
          break;
        case 9:
          API.sendChat("Lutrija je zavrsena, Tiket ID : " + randomPerson + " je upravo osvojio 2000 plug poena. Molim te da uslikas ovu poruku kao dokaz da bi ti admin mogao poslati poene.");
          break;
        case 10:
          API.sendChat("Lutrija je zavrsena, Cestitam! Tiket ID : " + randomPerson +  " je upravo osvojio DJ mjesto.");
          break;
      }
	  }, 120000)


                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(bBot.chat.roomrules, {
                                link: bBot.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = bBot.room.roomstats.totalWoots;
                        var mehs = bBot.room.roomstats.totalMehs;
                        var grabs = bBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(bBot.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(bBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (bBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    bBot.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < bBot.settings.skipReasons.length; i++) {
                                var r = bBot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += bBot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(bBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (bBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    bBot.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            bBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(bBot.chat.skippos, {
                                name: chat.un,
                                position: bBot.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.songstats) {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.songstats
                            }));
                        } else {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.songstats
                            }));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat("/me The source of code is basic bot with custom commands. Maintaned by BP Team.");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += bBot.chat.afkremoval + ': ';
                        if (bBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += bBot.chat.afksremoved + ": " + bBot.room.afkList.length + '. ';
                        msg += bBot.chat.afklimit + ': ' + bBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (bBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.blacklist + ': ';
                        if (bBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.lockguard + ': ';
                        if (bBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.cycleguard + ': ';
                        if (bBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.timeguard + ': ';
                        if (bBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.chatfilter + ': ';
                        if (bBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.historyskip + ': ';
                        if (bBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.voteskip + ': ';
                        if (bBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.cmddeletion + ': ';
                        if (bBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += bBot.chat.autoskip + ': ';
                        if (bBot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = bBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(bBot.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 256){
                            firstpart = msg.substr(0, 256);
                            secondpart = msg.substr(256);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 241) {
                            var split = msg.match(/.{1,241}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat("/me " + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = bBot.userUtilities.lookupUserName(name1);
                        var user2 = bBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(bBot.chat.swapinvalid, {
                            name: chat.un
                        }));
                        if (user1.id === bBot.loggedInID || user2.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbottowaitlist, {
                            name: chat.un
                        }));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(bBot.chat.swapwlonly, {
                            name: chat.un
                        }));
                        API.sendChat(subChat(bBot.chat.swapping, {
                            'name1': name1,
                            'name2': name2
                        }));
                        if (p1 === -1) {
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function(user1, p2) {
                                bBot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        } else if (p2 === -1) {
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function(user2, p1) {
                                bBot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        } else if (p1 < p2) {
                            bBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function(user1, p2) {
                                bBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        } else {
                            bBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function(user2, p1) {
                                bBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.themeLink === "string")
                            API.sendChat(subChat(bBot.chat.genres, {
                                link: bBot.settings.themeLink
                            }));
                    }
                }
            },

            thorCommand: {
                command: 'thor',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.thorCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedThor = false,
                                indexArrUsedThor,
                                thorCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 15) + 1,
                                worthy = worthyAlg == 1 ? true : false;

                            /* test purpose
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            } */


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < bBot.room.usersUsedThor.length; i++) {
                                    if (bBot.room.usersUsedThor[i].id == id) {
                                        oldTime = bBot.room.usersUsedThor[i].time;
                                        usedThor = true;
                                        indexArrUsedThor = i;
                                    }
                                }

                                if (usedThor) {
                                    timeInMinutes = (bBot.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    thorCd = timeInMinutes > 0 ? true : false;
                                    if (thorCd == false)
                                        bBot.room.usersUsedThor.splice(indexArrUsedThor, 1);
                                }

                                if (thorCd == false || usedThor == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    bBot.room.usersUsedThor.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(bBot.chat.thorNotClose, {
                                    name: from
                                }));
                            } else if (thorCd) {
                                return API.sendChat(subChat(bBot.chat.thorcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    bBot.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(bBot.chat.thorWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    bBot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(bBot.chat.thorNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.timeGuard) {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.timeguard
                            }));
                        } else {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = bBot.settings.blacklistEnabled;
                        bBot.settings.blacklistEnabled = !temp;
                        if (bBot.settings.blacklistEnabled) {
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(bBot.chat.toggleoff, {
                            name: chat.un,
                            'function': bBot.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.motdEnabled) {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.motd
                            }));
                        } else {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.voteSkip) {
                            bBot.settings.voteSkip = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.voteskip
                            }));
                        } else {
                            bBot.settings.voteSkip = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.voteskip
                            }));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(bBot.chat.notbanned, {
                                name: chat.un
                            }));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = bBot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > API.ROLE.BOUNCER) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(bBot.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(bBot.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(bBot.chat.notbanned, {
                                    name: chat.un
                                }));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            bBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(bBot.chat.commandscd, {
                                name: chat.un,
                                time: bBot.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(bBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.usercommands
                            }));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.usercommands
                            }));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(bBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(bBot.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.voteskiplimit, {
                            name: chat.un,
                            limit: bBot.settings.voteSkipLimit
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.voteSkip) bBot.settings.voteSkip = !bBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(bBot.chat.voteskipinvalidlimit, {
                                name: chat.un
                            }));
                        } else {
                            bBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(bBot.chat.voteskipsetlimit, {
                                name: chat.un,
                                limit: bBot.settings.voteSkipLimit
                            }));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (bBot.settings.welcome) {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {
                                name: chat.un,
                                'function': bBot.chat.welcomemsg
                            }));
                        } else {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleon, {
                                name: chat.un,
                                'function': bBot.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.website === "string")
                            API.sendChat(subChat(bBot.chat.website, {
                                link: bBot.settings.website
                            }));
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;

                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish';
                                } else if (rawlang == 'fr') {
                                    var language = 'French';
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese';
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese';
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak';
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch';
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay';
                                }

                                var rawrank = API.getUser(id);

                                if (rawrank.role == API.ROLE.NONE) {
                                    var rank = 'User';
                                } else if (rawrank.role == API.ROLE.DJ) {
                                    var rank = 'Resident DJ';
                                } else if (rawrank.role == API.ROLE.BOUNCER) {
                                    var rank = 'Bouncer';
                                } else if (rawrank.role == API.ROLE.MANAGER) {
                                    var rank = 'Manager';
                                } else if (rawrank.role == API.ROLE.COHOST) {
                                    var rank = 'Co-Host';
                                } else if (rawrank.role == API.ROLE.HOST) {
                                    var rank = 'Host';
                                }

                                if (rawrank.gRole == 3000) {
                                    var rank = 'Brand Ambassador';
                                } else if (rawrank.gRole == 5000) {
                                    var rank = 'Admin';
                                }

                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(bBot.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },

            // CUSTOM
		
	      googleCommand: {
                command: ['google', 'trazi'],
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1).replace(/ /g, "+");
                        API.sendChat("# @" + chat.un + ", Trazio si: " + "https://www.google.com/search?q=" + input);


                    }
                }
            },

            watchCommand: {
                command: ['watch', 'gledaj'],
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1).replace(/ /g, "+");
                        $.getJSON('https://filmoviplex.com/wp-json/wp/v2/movies?search=' + input, function(data) {
                            API.sendChat("# @" + chat.un + ", Gledaj Online: " + data[0].link);
                        })

                    }
                }
            },

            movieCommand: {
                command: 'movie',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1).replace(/ /g, "+");
                        $.getJSON('https://www.omdbapi.com/?t=' + input + '&apikey=e10dac66', function(data) {
                            API.sendChat("# @" + chat.un + ", Naziv: " + data.Title + ", Plot: " + data.Plot);
                        })

                    }
                }
            },

            askCommand: {
                command: 'ask',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1);
                        $.getJSON('https://yesno.wtf/api/', function(data) {
                            API.sendChat("# @" + chat.un + ", " + data.answer + " : " + data.image);
                        })

                    }
                }
            },

            rabitroomCommand: {
                command: 'rabit',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = "https://www.rabb.it/groups/balkan";
                        API.sendChat(subChat(bBot.chat.rabitroom, {
                            name: chat.un,
                            link: link
                        }));
                    }
                }
            },

            checkCommand: {
                command: 'check',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1);
                        if (input == API.getHistory().cid) {
                            return API.sendChat("Ta pjesma je history.");
                        } else {
                            return API.sendChat("Ta pjesma nije history");
                        }


                    }
                }
            },


            vrijemeCommand: {
                command: 'vrijeme',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1);
                        $.getJSON('https://api.apixu.com/v1/current.json?key=dc3e950104fe433b947235434182802&q=' + input + "?callback=?", function(data) {
                            setTimeout(function() {
                                API.sendChat("Trenutno u " + data.name + ", " + data.country + ", " + data.temp_c + "°C, and " + data.text + " : " + data.icon);
                            }, 1000)

                        })

                    }
                }
            },


            tCommand: {
                command: 't',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var input = chat.message.substr(cmd.length + 1);
                        API.sendChat("@" + chat.un + " : " + input);
                        $.getJSON('https://www.cleverbot.com/getreply?key=CC7imeXYjXQ7i0DL2LrG50nOWNw&input=' + input + '.json', function(data) {
                            setTimeout(function() {
                                API.sendChat("#Tom - " + chat.un + " : " + data.output);
                            }, 2000)

                        })

                    }
                }
            },

            /*yoCommand: {
                command: 'yo',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat("@" + chat.un + " Moras da oznacis nekoga!!");
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat("@" + chat.un + " Taj korisnik ne postoji!!");
                            } else if (user.username === chat.un) {
                                return API.sendChat("@" + chat.un + "Ne mozes to!!");
                            } else {
                                $.getJSON('http://api.yomomma.info/', function(data) {
                                    API.sendChat("/em @" + user.username + " : " + data.joke);
                                })
                            }
                        }
                    }
                }
            },*/

            /*chuckCommand: {
                command: 'chuck',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
					$.getJSON('https://api.chucknorris.io/jokes/random', function(data) {
					API.sendChat("/em @" + chat.un + " : " + data.value);
					})
						
                    }
                }
            },*/

            showplaylistsCommand: {
                command: ['showplaylists', 'botpls'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.showPlaylists();
                        API.sendChat(subChat(bBot.chat.botshowplaylist, {
                            name: chat.un
                        }));
                    }
                }
            },

            shuffleCommand: {
                command: 'shuffle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.shufflePlaylist();
                        API.sendChat("@" + chat.un + " Izmjesao sam moju playlistu. Yeah!");
                    }
                }
            },

            grabCommand: {
                command: 'grab',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.grab();
                        API.sendChat("@" + chat.un + " Upravo sam grabovao pjesmu. Wooot!!");
                    }
                }
            },

            listjoinCommand: {
                command: ['play', 'jumpup'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.listJoin();
                        API.sendChat("@" + chat.un + " Usao sam u listu cekanja. Idemo Party!!!");
                    }
                }
            },

            listleaveCommand: {
                command: ['leave', 'jumpdown'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.listLeave();
                        API.sendChat("@" + chat.un + " Napustio sam listu cekanja!!");
                    }
                }
            },
            listtoggleCommand: {
                command: ['botdj', 'dj'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        bBot.botInterfaceUtilities.listToggle();
                    }
                }
            },

            switchPlaylistCommand: {
                command: ['switchplaylist', 'botpl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return;

                        var listname = msg.substring(cmd.length + 1);
                        bBot.botInterfaceUtilities.switchPlaylist(listname);
                        API.sendChat("@" + chat.un + " Zamjenjujem moju playlistu sa " + listname);
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = bBot.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(bBot.chat.botactive, {
                            name: chat.un,
                            time: since
                        }));
                    }
                }
            },


            propsCommand: {
                command: 'props',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            var dj = API.getDJ();
                            var props = [
                                "Awwww fukin sick cunt",
                                "This song = 11/10 IGN",
                                "This track is amazing",
                                "Awesometastic play",
                                "Love this song <3",
                                "This is top shit",
                                "Excellent tune",
                                "Awesome track",
                                "Amazing song",
                                "Just amazing",
                                "Great song",
                                "Nice play",
                                "Killer",
                                "Yo, this is some dope shit",
                                "Finally someone played this song.",
                                "I am in love with this song.",
                                "Looks like i found Dj for my weeding."
                            ];
                            msg = props[Math.floor(Math.random() * props.length)];
                            API.sendChat("/me # @" + chat.un + " gave props to @" + dj.username + ", : " + msg + "!");
                            return false;
                        } else {
                            var user = dj.username;
                            if (user === false || !user.inRoom) {
                                return API.sendChat("@" + chat.un + "Nema Dj-a.");
                            } else if (user.username === chat.un) {
                                return API.sendChat("@" + chat.un + "Ne mozes sam sebi davati props.");
                            } else {
                                return API.sendChat("@" + chat.un + "Ne mozes da oznacis nekog.");
                            }
                        }
                    }
                }
            },

            matchCommand: {
                command: 'match',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            return API.sendChat("@" + chat.un + "Moras da oznacis nekoga!");
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat("@" + chat.un + "Korisnik nije tu ili ne postoji!");
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                var max = Math.floor(Math.random() * 101);
                                if (max == 0) {

                                    var zeroMatch = [
                                        "Brzo, odjavi se, niko nije vidio pa cak ni ti..."
                                    ];

                                    API.sendChat("/me [match] @" + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + zeroMatch[Math.floor(Math.random() * zeroMatch.length)]);
                                } else if (max > 1 && max < 20) {

                                    var lowMatch = [
                                        "Zao nam je, ali vasa ljubav je vjerojatno tolika da će donijeti plod kao mango stablo posadjeno na antarktickom gleceru.",
                                        "Ljudi kazu ljubav je slijepa, u ovom slucaju jeste.",
                                        "Znas kako kazu ljubav na prvi pogled, pa odgovoris, ako nije bilo dovoljno da prodjem opet. To bi trebali raditi dok ne ostarite."
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + lowMatch[Math.floor(Math.random() * lowMatch.length)]);
                                } else if (max > 20 && max < 40) {

                                    var low2Match = [
                                        "Ako ste zajedno vec, predvidjam raskid za 9, 8, 7, dobijas vec sliku. Ako niste zajedno, bjezite sto dalje i ostanite jasni. Sorry ali ovo nece ici.",
                                        "Mrzim biti nositelj losih vijesti, ali ovaj odnos ima toliko sanse kao Angelina i Brad Pitt. Cekaj, jesu li jos uvijek zajedno? Pretpostavljam da mozes pokusati, ali nece biti lahko.",
                                        "Vasa ljubav je poput onoga sto roditelj s novorodjenim djetetom osjeca za spavanje, daleko i bez razmatranja.",
                                        "Vasa ljubac je toliko jaka kao i ljubav izmedju vecine djece i njihovom povrca - beznacajna.",
                                        "Izgleda dobro, ali nemojte jos poceti experimentisati s tim.",
                                        "Radite na tome, Romeo i Julija nisu izgradjeni u jednom danu. Igraj dalje.",
                                        "Nije lose, ali nije i previse dobro, bolje da izadjete it te zone sto brze."
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + low2Match[Math.floor(Math.random() * low2Match.length)]);
                                } else if (max > 40 && max < 60) {

                                    var midMatch = [
                                        "Mala je sansa da bi mogli uspijeti, bit ce tesko ali svejedno. Yolo.",
                                        "Iako moj sofisticirani algoritam kaze da necete uspijeti, zasto ne bi pokusali. Siguran sam da mozes pobjediti vjerovatnost.",
                                        "Takva se ljubav moze vidjeti u ocima psa koji zeli nastaviti igru sa svojim iscrpljenim vlasnikom.",
                                        "Vasa se ljubav moze usporediti sa prometom na ulici. Sporo i frustrirajuce, ali moguce se kretati kroz upornost i silu volje.",
                                        "Tama ne moze izbaciti tamu, samo svijetlo to moze uciniti. Mrznja ne moze izbaciti mrznju, samo ljubav to moze uciniti.",
                                        "Na dodir medjusebne ljubavi, oboje postajete pjesnici.",
                                        "U vasem odnosu, ljubav ne dominira vec raste. I tako bi trebalo biti."
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + midMatch[Math.floor(Math.random() * midMatch.length)]);
                                } else if (max > 60 && max < 80) {

                                    var mid2Match = [
                                        "Ocjena 4-! Sanse su da ce te uspijeti, ali jedva.",
                                        "Morate vise pokusavati, ali imate sanse.",
                                        "Dovoljno dobro, mozda da provjerite i ljubav sa vaseg popia stvari za koje drustvo vjeruje da ste trebali do sad ostvariti.",
                                        "Ova razina ljubavi jednaka je mackinoj ljubavi prema kutijama. Mozda nije odmah vidljivo, ali pogledaj u kutiju i mozda ste pronasli nesto spremno da iskoci na vas.",
                                        "Vjerovatno postoji nesto. Samo provjerite je li vasa prisutnost uocena.",
                                        "Ljubav je za vas, obeanje, to je suvenir, jednom davno nikad zaboravljen. Zivio!!",
                                        "Vi ste najzivlji kad se zaljubljeni u jedno drugo.",
                                        "Vi ste odabrali jedno drugo. I birat ce te jedno drugo godinama. bez pauze, bez sumnje, sretni ste sto imate jedno drugo."
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + mid2Match[Math.floor(Math.random() * mid2Match.length)]);
                                } else if (max > 80 && max < 95) {

                                    var highMatch = [
                                        "Sjedite pored drveta, ljubite se. Prvo dolazi ljubav, pa onda dolazi vjencanje, a onda dolazi beba. Aww vas dvoje ste stvoreni jedno za drugo.",
                                        "Vasa ljubav je toliko jaka kao izmedju vlasnika i njegovom ljubimca! Uhvatljiva u odanosti i u udobnosti.",
                                        "Vasa ljubav gori vrucinom poput sunca, raspaljuje se kroz prostranost svemira.",
                                        "Vi biste radije cijeli zivot proveli jedno s drugim nego se suocili sa svim godinama ovog svijeta.",
                                        "Najveca sreca u vasem zivotu bit ce uvjerenje da ste vi zaljubljeni.",
                                        "Wow, ovo je nesto posebno, po rijecima Beyonce, vi ste besprijekorni zajedno."
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + highMatch[Math.floor(Math.random() * highMatch.length)]);
                                } else if (max == 100) {

                                    var high2Match = [
                                        "Vasa ljubav gori vrucinom poput sunca, raspaljuje se kroz prostranost svemira.",
                                        "Predvidjan Vjencanje <3"
                                    ];

                                    API.sendChat("/me [match] " + chat.un + ", @" + user.username + " kompatibilni : " + max + "% :" + high2Match[Math.floor(Math.random() * high2Match.length)]);
                                } else {
                                    API.sendChat("/me Nije bilo moguce izvrsiti naredbu.");
                                }

                            }
                        }
                    }
                }
            },

            playCommand: {
                command: ['78416448971'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        robotBoyDJing()

                        if (!robotBoyDJTimeout || getRank(chat.un) > 1) {
                            if (!modAssignedDJ || getRank(chat.un) > 1) {
                                if (!robotBoyDJ) {
                                    if (getRank(chat.un) > 1) {
                                        modAssignedDJ = true
                                    }

                                    API.djJoin();
                                    API.sendChat("@" + chat.un + ", Usao sam na listu cekanja! Necu te razocarati..");
                                } else {
                                    if (robotBoyCurrentDJ && API.getUsers().length > 2) {
                                        robotBoyDJLeave = true;
                                        API.sendChat("@" + chat.un + ", pusti me prvo da zavrsim sa ovom pjesmom, pa cu onda napustit listu cekanja.");
                                    } else {
                                        API.djLeave();
                                        modAssignedDJ = false
                                        API.sendChat("@" + chat.un + ", Napustio sam listu cekanja. Necu vise smetati sa mojom muzikom.");
                                        robotBoyDJTimeout = true
                                        setTimeout(robotBoyDJTimeoutFunction, 300000)
                                    }
                                }
                            } else {
                                API.sendChat("@" + chat.un + ", korisnik viseg ranka mi je rekao da udjem na listu cekanja. Ti me ne mozes izbaciti");
                            }
                        } else {
                            API.sendChat("@" + chat.un + ", molim sacekaj neko vrijeme da me dodas ponovo a listu cekanja.");
                        }
                    }
                }
            },


            sayCommand: {
                command: ['say', 'repeat'],
                rank: 'bouncer',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var echoMessage = chat.message.substr(cmd.length + 1)
                        if (echoMessage.length == 0) {
                            API.sendChat("@" + chat.un + ", tesko je ponoviti nista.");
                        } else if (echoMessage[0] == "!" || echoMessage.includes(" !")) {
                            API.sendChat("@" + chat.un + ", pokusavas da ponovim komandu? Nista od toga, pokusaj nesto drugo.");
                        } else if ((echoMessage.includes("Ja ") || echoMessage.includes("Ja sam ") || echoMessage.includes("ja ") || echoMessage.includes("ja sam ")) && (echoMessage.includes("glup") || echoMessage.includes("Glup") || echoMessage.includes("retard"))) {
                            API.sendChat("@" + chat.un + " Glup.");
                        } else {
                            bBot.room.echoHistory1.push(chat.un);
                            bBot.room.echoHistory2.push(echoMessage);
                            API.sendChat(echoMessage);
                        }
                    }
                }
            },

            randomCommand: {
                command: 'roll',
                rank: 'user',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
var Timer_Started = false;
var Timer = setTimeout(DoThis,60000);

function DoThis(){
Timer_Started = true;
if(Timer_Started){

   var user = bBot.userUtilities.lookupUserName(name);
                        var id = chat.uid;
                        var randomMax = chat.message.substr(cmd.length + 1);
                        if ((isNaN(randomMax) == true) || (randomMax.length == 0)) {
                            var randomMax = 30
                        }
                        var randomispis = Math.floor((Math.random() * randomMax) + 1)
                        if (randomispis == 6) {
                            bBot.userUtilities.moveUser(id, 1, false);
                            return API.sendChat("@" + chat.un + ", cestitam, upravo si osvojio prvo mjesto. [LDO]");
                        } else {
                            API.sendChat("@" + chat.un + ", tvoj nasumicno odabran broj je " + randomispis + ". Nemas srece. [LDO]");
                        }
   Timer_Started = true;
   } else{
      API.sendChat("U toku je vec izvlacenje pokusaj kasnije.");
   }

}

function Check_If_My_Timer_Is_Done(){

   if(Timer_Started){
      API.sendChat("@" + chat.un + ", u toku je vec izvlacenje.");
   }else{
      alert("Done");
   }

}
 	
                    }
                }
            },

            loveCommand: {
                command: ['love'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var love = ""

                        for (var i = 0; i < (Math.floor((Math.random() * 10) + 1)); i++) {
                            var love = love + ":heart: "
                        }

                        API.sendChat("/me @" + chat.un + " : " + love);
                    }
                }
            },

            /* randomCommand: {
            	command: ['random'],
            	rank: 'user',
            	type: 'startswith',
            	functionality: function(chat, cmd) {
            		if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
            		if (!bBot.commands.executable(this.rank, chat)) return void(0);
            		else {
            			var user = bBot.userUtilities.lookupUserName(name);
            			var randomMax = chat.message.substr(cmd.length + 1)
            			if ((isNaN(randomMax) == true) || (randomMax.length == 0)) {
            				var randomMax = 10
            			}

            			API.sendChat("@" + chat.un + ", tvoj nasumicno odabran broj je " + Math.floor((Math.random() * randomMax) + 1) + ".");
            		}
            	}
            }, */

            echoHistoryCommand: {
                command: ['sayhistory', 'repeathistory'],
                rank: 'mod',
                type: 'startswith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var echoNumber = chat.message.substr(cmd.length + 1)
                        if (echoNumber.length == 0) {
                            if (bBot.room.echoHistory1.length == 1) {
                                API.sendChat("@" + chat.un + ", bilo je samo 1 ponavljanje tokom mog boravka ovdje. Ukucaj \"!sayhistory NUMBER\" da vidis prosle poruke.");
                            } else {
                                API.sendChat("@" + chat.un + ", bilo je samo " + bBot.room.echoHistory1.length + " ponavljanja tokom mog boravka ovdje. Ukucaj \"!echohistory NUMBER\" da vidis prosle poruke.");
                            }
                        } else if (isNaN(echoNumber) == true) {
                            API.sendChat("@" + chat.un + ", \"" + echoNumber + "\" nije broj..");
                        } else if (echoNumber > bBot.room.echoHistory1.length) {
                            API.sendChat("@" + chat.un + ", nije bilo ponavljanja poruka tokom mog boravka ovdje.");
                        } else if (echoNumber - 1 < 0) {
                            API.sendChat("@" + chat.un + ", nemoj da se pravis pametan :D.");
                        } else {
                            API.sendChat("@" + bBot.room.echoHistory1[echoNumber - 1] + " Poruka: " + bBot.room.echoHistory2[echoNumber - 1]);
                        }
                    }
                }
            },

            truthCommand: {
                command: 'truth',
                rank: 'user',
                type: 'startsWith',
                getTruth: function(chat) {
                    var c = Math.floor(Math.random() * bBot.chat.truths.length);
                    return bBot.chat.truths[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.trutherror, {
                                name: chat.un,
                                fortune: this.getTruth()
                            }));
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.trutherror, {
                                    name: chat.un
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.trutherror, {
                                    name: chat.un
                                }));
                            } else {
                                return API.sendChat(subChat(bBot.chat.truth, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    picks: this.getTruth()
                                }));
                            }
                        }
                    }
                }
            },

            subscribeCommand: {
                command: ['subscribe'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.subscribe, {
                            name: chat.un
                        }));
                    }
                }
            },

            // HiddenComand
            /* adnaCommand: {
                command: 'adna',
                rank: 'user',
                type: 'startsWith',
                getAdnaa: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.adna.length);
                    return bBot.chat.adna[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.adna, {adnaa: this.getAdnaa()}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.selfadna, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfadna, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.selfadna, {name: name}));
                            }
                        }
                    }
                }
            }, */

            fortunecookieCommand: {
                command: 'fortunecookie',
                rank: 'user',
                type: 'startsWith',
                getFcookie: function(chat) {
                    var c = Math.floor(Math.random() * bBot.chat.fcookies.length);
                    return bBot.chat.fcookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.fortunecookie, {
                                name: chat.un,
                                fortune: this.getFcookie()
                            }));
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {
                                    name: name
                                }));
                            }
                        }
                    }
                }
            },

            prcCommand: {
                command: 'prc',
                rank: 'bouncer',
                type: 'startsWith',
                getPrc: function(chat) {
                    var c = Math.floor(Math.random() * bBot.chat.prcs.length);
                    return bBot.chat.prcs[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.selfprc, {
                                name: name
                            }));
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nouserprc, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfprc, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(bBot.chat.prc, {
                                    nameto: user.username,
                                    prc: this.getPrc()
                                }));
                            }
                        }
                    }
                }
            },

            giftCommand: {
                command: 'gift',
                rank: 'user',
                type: 'startsWith',
                getGift: function(chat) {
                    var c = Math.floor(Math.random() * bBot.chat.gifts.length);
                    return bBot.chat.gifts[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.sgift);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousergift, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfgift, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(bBot.chat.gift, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    gift: this.getGift()
                                }));
                            }
                        }
                    }
                }
            },

            rouletteinfoCommand: {
                command: 'rouletteinfo',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.rouletteinfo, {
                            name: chat.un
                        }));
                    }
                }
            },

            mediaidCommand: {
                command: 'mediaid',
                rank: 'residentdj',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(API.getMedia().format + ":" + API.getMedia().cid, true);
                    }
                }
            },

            vdownloadCommand: {
                command: 'vdownload',
                rank: 'residentdj',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var linkToSong = "http://www.sfrom.net/https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.vdownload, {
                            name: chat.un,
                            link: linkToSong
                        }));
                    }
                }
            },

            downloadCommand: {
                command: 'download',
                rank: 'residentdj',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var linkToSong = "https://www.youtubeinmp3.com/fetch/?video=https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.download, {
                            name: chat.un,
                            link: linkToSong
                        }));
                    }
                }
            },

            roomhelpCommand: {
                command: 'roomhelp',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.roomhelp, {
                            name: chat.un
                        }));
                    }
                }
            },

            slotsCommand: {
                command: ['slots', 'slot'], //The command to be called. With the standard command literal this would be: !slots
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        var user = chat.un;
                        var updatedTokens;
                        var bet = parseInt(msg.substring(space + 1));

                        //Fix bet if blank
                        if (bet == null || isNaN(bet)) {
                            bet = 1;
                        }
                        bet = Math.round(bet);

                        var playerTokens = checkTokens(bet, user);

                        //Prevent invalid betting
                        if (bet > playerTokens[0]) {
                            if (playerTokens[0] === 0) {
                                return API.sendChat("/me [#] @" + chat.un + " pokusava iskoristiti " + bet + " Token na ChemSlots, ali nema ni jedan! Kako neugodno.");
                            } else if (playerTokens[0] === 1) {
                                return API.sendChat("/me [#] @" + chat.un + " pokusava iskoristiti " + bet + " Token na ChemSlots, ali ima samo jedan. Mislis da imas srece?");
                            } else {
                                return API.sendChat("/me [#] @" + chat.un + " pokusava iskoristiti " + bet + " Token na ChemSlots, ali ima samo " + playerTokens[0] + " Kako neugodno.");
                            }
                        } else if (bet < 0) {
                            return API.sendChat("/me [#] @" + chat.un + " pokusava iskoristit " + bet + " Token na ChemSlots... ali nije uspio.");
                        } else if (bet === 0) {
                            return API.sendChat("/me [#] @" + chat.un + " pokusava se kladiti u nista ... ne mozes igrati za dzabe! Bas si jeftin.");
                        }
                        //Process valid bets
                        else {
                            var outcome = spinOutcome(bet);
                            updatedTokens = slotWinnings(outcome[3], user);
                        }

                        //Display Slots
                        if (space === -1 || bet == 1) {
                            //Start Slots
                            API.sendChat("/me [#] @" + chat.un + " ulaže 1 Token na ChemSlots, i povlači ručicu ... i gleda kako se ChemSlots okrece.");
                            setTimeout(function() {
                                API.sendChat("/me  Napokon se zaustavlja na: " + outcome[0] + outcome[1] + outcome[2])
                            }, 5000);
                        } else if (bet > 1) {
                            //Start Slots
                            API.sendChat("/me [#] @" + chat.un + " ulaže " + bet + " Token na ChemSlots, i povlači ručicu... ... i gleda kako se ChemSlots okrece.");
                            setTimeout(function() {
                                API.sendChat("/me Napokon se zaustavlja na: " + outcome[0] + outcome[1] + outcome[2])
                            }, 5000);
                        } else {
                            return false;
                        }

                        //Display Outcome
                        if (outcome[3] == 0) {
                            if (updatedTokens === 1) {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", nemaš sreće. Nisi pobjedio. Preostalo 1 TOKEn. Želiš li pokusati ponovo?")
                                }, 7000);
                            } else if (updatedTokens === 0) {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", nemaš sreće. Nisi pobjedio. Nemas vise Tokena.")
                                }, 7000);
                            } else {
                                setTimeout(function() {
                                    API.sendChat("/me @" + chat.un + ", nemaš sreće. Nisi dobio nista. Imas " + updatedTokens + " Tokena. Želis li pokušati ponovo?")
                                }, 7000);
                            }
                        } else if (outcome[3] == (bet * 7)) {
                            setTimeout(function() {
                                var id = chat.uid;
                                API.sendChat("/me @" + chat.un + ", Pogodio si Jackpot: " + outcome[3] + " Tokena! Sada imaš " + updatedTokens + " Nemoj ih sve odjednom potrošit.");
                                bBot.userUtilities.moveUser(id, 1, false);
                            }, 7000);
                        } else {
                            setTimeout(function() {
                                var id = chat.uid;
                                var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                                API.sendChat("/me @" + chat.un + ", Pobjedio si! Dobio si " + outcome[3] + " Tokena! Sada imaš " + updatedTokens + " Tokena.");
                                bBot.userUtilities.moveUser(id, pos, false);
                            }, 7000);
                        }
                    }
                }
            },

            // !tokens
            tokensCommand: {
                command: 'tokens',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var user = chat.un;
                        var tokens = validateTokens(user);

                        API.sendChat("/me [!tokens] @" + user + ", imas " + tokens + " TOKEna. Mozda zelis jos? Sretno na ruletu ili zatrazi od admina.");
                    }
                }
            },

            //THIS WILL ONLY RESET TOKENS IT WONT GIVE ADDITIONAL TOKENS
            givetokensCommand: {
                command: 'givetokens',
                rank: 'su',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var user = chat.un;
                        var id = chat.uid;
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.stokens);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousertokens, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selftokens, {
                                    name: name
                                }));
                            } else {
                                var user = bBot.userUtilities.lookupUserName(name);
                                var startingTokens = validateTokens(user);
                                var randomMax = 3;
                                var randomispis = Math.floor((Math.random() * randomMax) + 1)
                                localStorage.setItem(user.username, randomispis);
                                return API.sendChat(subChat(bBot.chat.giventokens, {
                                    nameto: user.username,
                                    namefrom: chat.un
                                }));
                            }


                        }
                    }
                }
            },

            // NEEEDS TO BE FIXED
            /* tip
            tiptokensCommand: { 
                command: 'tip',  //The command to be called. With the standard command literal this would be: !tip
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message; 
                        var space = msg.indexOf(' ');
                        var receiver = msg.substring(space + 2); 
                        var giverTokens = validateTokens(chat.un);
                        var receiverTokens = validateTokens(receiver);
                        var currentDJ = API.getDJ().username; 
                
                        if (giverTokens <= 0) {
                            return API.sendChat("/me @" + chat.un + " tries to tip @" + receiver + ", for the awesome tunes, but doesn't have any TOKEns! It's the thought that counts, right?"); 
                        }
                        else {
                            receiverTokens += 1;
                            giverTokens -= 1;
                            localStorage.setItem(chat.un, giverTokens);
                            if (space === -1) { 
                                receiverTokens = validateTokens(currentDJ);
                                receiverTokens += 1; //Repeat check in the event tip is for current DJ.
                                localStorage.setItem(currentDJ, receiverTokens);
                                return API.sendChat("/me @" + chat.un + " tips @" + currentDJ + " for their contirbution to the art of great music.  @" + chat.un + " has " + giverTokens + " TOKEns left. @" + currentDJ + " now has " + receiverTokens + " TOKEns."); 
                            }
                            else {                        
                                localStorage.setItem(receiver, receiverTokens);
                                return API.sendChat("/me @" + chat.un + " tips @" + receiver + " for throwing down great tracks! @" + chat.un + " has " + giverTokens + " TOKEns left. @" + receiver + " now has " + receiverTokens + " TOKEns.");
                            }
                        }
                    }
                }
            }, */

            /* !resettokens
            resettokensCommand: { 
                command: 'resettokens',  //The command to be called. With the standard command literal this would be: !cleartokens
                rank: 'manager', //Minimum user permission to use the command
                type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        localStorage.clear();
                        localStorage.setItem("Dave1.0", "500");
                        API.sendChat("/me Tokeni za sve korisnike su resetovani.");
                    }
                }
            }, */


            /* BROKEN COMMAND
             givetokensCommand: { 
                command: 'givetokens',  //The command to be called. With the standard command literal this would be: !givetokens
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message; 
                        var space = msg.indexOf(' ');
                        var parse = msg.Split(' ');
                        var name = msg.substring(space + 2);
                        var gift = parse[2];
                        var user = bBot.userUtilities.lookupUserName(name); 
                        var startingTokens = validateTokens(user);
                        var updatedTokens;
                        
                        if (space === -1) { 
                             API.sendChat("/me @" + chat.un + ", pokušaj oznacit nekog drugog."); 
                        } 
                        
                        if (gift == null || gift == "" || gift == " " || gift == "!givetokens" || isNaN(gift)) {
                             gift = 1;
                        }
                           
                        updatedTokens = Math.round(gift) + startingTokens;
                        localStorage.setItem(user, updatedTokens);
                        return API.sendChat("/me @" + chat.un + " daje @" + user + " " + gift + " tokena. @" + user + " sada ima " + updatedTokens + " tokena.");
                    }
                }
            }, */

            rpsCommand: {
                command: 'rps',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.rpslsempty));
                            return false;
                        } else {
                            var choices = ["rock", "paper", "scissors", "lizard", "spock"];
                            var botChoice = choices[Math.floor(Math.random() * choices.length)];
                            var userChoice = msg.substring(space + 1);
                            if (botChoice == userChoice) {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslsdraw, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "rock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "rock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "rock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "rock" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "paper" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "paper" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "paper" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "paper" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "scissors" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "scissors" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "scissors" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "scissors" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "lizard" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "lizard" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "lizard" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "lizard" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "spock" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "spock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else if (botChoice == "spock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {
                                    name: chat.un
                                }));
                                API.moderateForceSkip();

                            } else if (botChoice == "spock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {
                                    name: chat.un
                                }));

                            } else {
                                return API.sendChat(bBot.chat.rpserror, {
                                    botchoice: botChoice,
                                    userchoice: userChoice
                                });
                            }
                        }
                    }
                }
            },

            botCommand: {
                command: 'bot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.dave, {
                            name: chat.un
                        }));
                    }
                }
            },

            //SPECIAL COMMANDS
            eldoxCommand: {
                command: 'eldox',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.eldox, {
                            name: chat.un
                        }));
                    }
                }
            },
            stumblrCommand: {
                command: 'stumblr',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = "http://name-is-already-taken.tumblr.com/";
                        API.sendChat(subChat(bBot.chat.stumblr, {
                            name: chat.un,
                            link: link
                        }));
                    }
                }
            },
            askfmCommand: {
                command: 'askfm',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = "http://ask.fm/BalkanParty12";
                        API.sendChat(subChat(bBot.chat.ask, {
                            name: chat.un,
                            link: link
                        }));
                    }
                }
            },
            tacaCommand: {
                command: 'taca',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.taca, {
                            name: chat.un
                        }));
                    }
                }
            },
            huligankaCommand: {
                command: 'huliganka',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.huliganka, {
                            name: chat.un
                        }));
                    }
                }
            },
            vlajkoCommand: {
                command: 'vlajko',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.vlajko, {
                            name: chat.un
                        }));
                    }
                }
            },
            masickaCommand: {
                command: 'masicka',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.masicka, {
                            name: chat.un
                        }));
                    }
                }
            },
            teaCommand: {
                command: 'tea',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.tea, {
                            name: chat.un
                        }));
                    }
                }
            },
            natalijaCommand: {
                command: 'natalija',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.natalija, {
                            name: chat.un
                        }));
                    }
                }
            },
            selmaCommand: {
                command: 'selma',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.selma, {
                            name: chat.un
                        }));
                    }
                }
            },
            roxorCommand: {
                command: 'roxor',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.roxor, {
                            name: chat.un
                        }));
                    }
                }
            },
            mujoCommand: {
                command: 'mujo',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.mujo, {
                            name: chat.un
                        }));
                    }
                }
            },
            filipCommand: {
                command: ['filip', 'tjofi'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.filip, {
                            name: chat.un
                        }));
                    }
                }
            },
            mamuzaCommand: {
                command: 'mamuza',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.mamuza, {
                            name: chat.un
                        }));
                    }
                }
            },
            cobraCommand: {
                command: 'cobra',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.cobra, {
                            name: chat.un
                        }));
                    }
                }
            },
            anjaCommand: {
                command: 'anja',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.anja, {
                            name: chat.un
                        }));
                    }
                }
            },
            smrtnikCommand: {
                command: 'smrtnik',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.smrtnik, {
                            name: chat.un
                        }));
                    }
                }
            },
            ahmedCommand: {
                command: 'ahmed',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.ahmed, {
                            name: chat.un
                        }));
                    }
                }
            },
            songunbanCommand: {
                command: 'songunban',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.songunban, {
                            name: chat.un
                        }));
                    }
                }
            },
            danceCommand: {
                command: 'dance',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.botwoot, {
                            name: chat.un
                        }));
                        $(".btn-like").click();
                        API.on(API.ADVANCE, autowoot);

                        function autowoot() {
                            $(".btn-like").click();
                        }
                    }
                }
            },
            mehCommand: {
                command: 'meh',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(bBot.chat.botmeh));
                        $(".btn-meh").click();
                        API.on(API.ADVANCE, meh);
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof bBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(bBot.chat.youtube, {
                                name: chat.un,
                                link: "http://bit.ly/1JCermI"
                            }));
                    }
                }
            },
            //SLOW
            slowCommand: {
                command: 'slow',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var slow;

                        if (msg.length === cmd.length) {
                            slow = 30;
                        } else {
                            slow = msg.substring(cmd.length + 1);
                            if (isNaN(slow)) {
                                return API.sendChat(subChat(bBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                        }
                        if (!bBot.room.slowMode) {
                            bBot.room.slowMode = true;
                            bBot.room.slowModeDuration = slow;
                            API.sendChat("/me Spori način uključen, razmak između poruka: " + slow + " sekundi!");
                        } else {
                            bBot.room.slowMode = false;
                            bBot.room.slowModeDuration = 0;
                            API.sendChat("/me Spori način isključen!");
                        }

                    }
                }
            },

            pointsCommand: {
                command: 'points',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var sender = bBot.userUtilities.lookupUser(chat.uid);
                        var arguments = msg.split(' ');
                        var reciever = "";
                        var c = 0;
                        var rand = Math.random();

                        arguments = arguments.filter(checkNull);
                        console.log(arguments);
                        if (arguments[0] == "!points" && arguments.length == 1) {
                            $.ajaxSetup({
                                async: false
                            });
                            $.post("https://plugdj.hosting-plex.ga/_/points/room/data-get.php", {
                                winnerid: sender.id,
                                dbPassword: bBot.settings.dbPassword
                            }, function(data) {
                                sender.balkanPoints = parseInt(data.trim());
                            });
                            if (!isNaN(sender.balkanPoints)) {
                                return API.sendChat("/me [!points] @" + chat.un + " imaš " + sender.balkanPoints + " YU Poena.");
                            } else {
                                return API.sendChat("/me @" + chat.un + " imaš 0 YU Poena");
                            }


                        }
                        if (arguments.length > 3) {
                            for (i = 3; i < arguments.length; i++) {
                                if (reciever == "") {
                                    reciever = reciever + arguments[i];
                                } else {
                                    reciever = reciever + " " + arguments[i];
                                }
                            }
                            console.log(reciever);
                            if (arguments[1] == "bet" && !isNaN(arguments[2]) && arguments[2] > 0) {
                                var senderpoints;
                                var recieverpoints;

                                reciever = reciever.trim();
                                if (reciever.startsWith("@")) {
                                    reciever = reciever.trim().substring(1);
                                }
                                var recieverU = bBot.userUtilities.lookupUserName(reciever);
                                $.ajaxSetup({
                                    async: false
                                });
                                $.post("https://plugdj.hosting-plex.ga/_/points/room/data-get.php", {
                                    winnerid: sender.id,
                                    loserid: recieverU.id
                                }, function(data) {
                                    var points = data.trim().split(' ');
                                    sender.balkanPoints = parseInt(points[0]);
                                    recieverU.balkanPoints = parseInt(points[1]);
                                });
                                console.log(recieverU.inRoom);
                                if (recieverU == null || recieverU.inRoom && recieverU != sender) {
                                    var offer = parseInt(arguments[2]);
                                    if (sender.isBetting) {
                                        return API.sendChat("/me @" + chat.un + " već si započeo okladu s nekim! Upiši !points \"stop\" da ju prekineš!");
                                    }
                                    if (recieverU.isBetting) {
                                        return API.sendChat("/me @" + chat.un + " " + recieverU.username + " se već kladi s nekim!");
                                    }
                                    if (isNaN(sender.balkanPoints) || (sender.balkanPoints < offer)) {
                                        return API.sendChat("/me @" + chat.un + " nemaš dovoljno YU Poena za tu okladu!");
                                    }
                                    if (isNaN(recieverU.balkanPoints) || (recieverU.balkanPoints < offer)) {
                                        return API.sendChat("/me @" + chat.un + " osoba s kojom se želiš kladiti nema dovoljno BP Poena za tu okladu! Ima samo: " + recieverU.balkanPoints);
                                    }

                                    recieverU.isBetting = true;
                                    recieverU.better = sender;
                                    recieverU.offered = offer;
                                    sender.isBetting = true;
                                    sender.toWho = recieverU;
                                    API.sendChat("/me @" + recieverU.username + " " + chat.un + " te poziva na opkladu! u " + offer + " YU Poena. Upišisi \"!points accept\" ili \"!points decline\"");
                                    return;
                                } else {
                                    return API.sendChat("/me @" + chat.un + " osoba s kojom se želiš kladiti trenutno nije online! , ili si se pokušao kladiti sam s sobom!");
                                }
                            } else {
                                return API.sendChat("/me @" + chat.un + " Unijeli ste neispravnu komandu. Upiši !points za vise informacija.");
                            }
                        } else if (arguments[1] == "accept") {
                            if (!sender.isBetting) {
                                return API.sendChat("/me @" + chat.un + " Nitko vas nije izazvao na okladu!");
                            }
                            if (sender.better.inRoom) {

                                if (rand >= 0.5) {
                                    sender.balkanPoints += sender.offered;
                                    sender.better.balkanPoints -= sender.offered;

                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("https://plugdj.hosting-plex.ga/_/points/room/data-edit.php", {
                                        winnerid: sender.id,
                                        winnername: sender.username,
                                        pointswon: sender.offered,
                                        loserid: sender.better.id,
                                        losername: sender.better.username,
                                        dbPassword: bBot.settings.dbPassword
                                    }, function(data) {
                                        if (data.trim() != "PWD_OK") {
                                            API.sendChat("/me Problem sa upisivanjem podataka u bazu podataka!")
                                        };
                                    });
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " Oklada je završena! " + sender.username + " je pobjedio i osvojio " + sender.offered + " BP Poena");
                                } else {
                                    sender.balkanPoints -= sender.offered;
                                    sender.better.balkanPoints += sender.offered;

                                    $.ajaxSetup({
                                        async: false
                                    });
                                    $.post("https://plugdj.hosting-plex.ga/_/points/room/data-edit.php", {
                                        winnerid: sender.better.id,
                                        winnername: sender.better.username,
                                        pointswon: sender.offered,
                                        loserid: sender.id,
                                        losername: sender.username,
                                        dbPassword: bBot.settings.dbPassword
                                    }, function(data) {
                                        if (data.trim() != "PWD_OK") {
                                            API.sendChat("/me Problem sa upisivanjem podataka u bazu podataka!")
                                        };
                                    });
                                    var betusr = sender.better.username;
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " Oklada je završena! " + betusr + " je pobjedio i osvojio " + sender.offered + " YU Poena");

                                }

                            } else {
                                finishBet(sender);
                                return API.sendChat("/me @" + chat.un + " osoba koja te izazvala na okladu je trenutno offline, oklada se prekida!");
                            }
                        } else if (arguments[1] == "decline") {
                            if (!sender.isBetting) {
                                return API.sendChat("/me @" + chat.un + " Nitko vas nije izazvao na okladu!");
                            }
                            finishBet(sender);
                            return API.sendChat("/me @" + chat.un + " oklada prekinuta!");
                        } else if (arguments[1] == "stop") {
                            sender.isBetting = false;
                            sender.toWho.isBetting = false;
                            sender.toWho = null;

                            return API.sendChat("/me @" + chat.un + " oklada prekinuta!");
                        } else if (arguments[1] == "leaderboard") {
                            //  var leaders = bBot.room.users;
                            //  var ph;
                            //  for(i = 0; i< leaders.length; i++)
                            //  {
                            //      for(j = 0; j<leaders.length;i++)
                            //      {
                            //          if(leaders[i].AnimePoins < leaders[j].balkanPoints)
                            //          {
                            //              ph = leaders[i];
                            //              leaders[j] = leaders[i];
                            //              leaders[i] = ph;
                            //          }
                            //      }
                            //  }
                            //  API.sendChat("/me Top 10 osoba, s najviše bodova:");
                            //  for(i = 0; i<leaders.length; i++)
                            //  {
                            //      API.sendChat("/me " + i + ". " + leaders[i].username + " : " + leaders[i].balkanPoints);
                            //  }
                            return API.sendChat("Pogledaj leaderboard na ovom linku: https://yugoslavia-music.github.io/leaderboard.html");

                        } else if (arguments[1] == "help") {
                            API.sendChat("/me @" + chat.un + " Da bi vidio koliko imaš YU Poena upiši !points, da bi se kladio s nekim upiši !points bet [bodovi] [ime], da bi prekinio poziv napiši !points stop, da prihvatis !points accept, da bi odbio napiši !points decline");
                            return API.sendChat("/me da vidiš leaderboard upiši !points leaderboard");
                        } else {
                            return API.sendChat("/me @" + chat.un + " Unijeli ste nepostojecu komandu. Upiši !points help za vise informacija.");
                        }

                        function checkNull(arg) {
                            return arg !== null;
                        }

                        function finishBet(sender) {
                            sender.better.isBetting = false;
                            sender.isBetting = false;
                            sender.better = null;
                            return;
                        }
                    }
                }
            },
            announceCommand: {
                command: 'announce',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var arguments = chat.message.split(' ');
                        var amsg = getMessage(arguments);
                        if (arguments.length == 1 && arguments[0] == "!announce") {
                            API.sendChat("/me @" + chat.un + " upiši !ap [nakon koliko minuta da se objavi poruka] [poruka] ili !announce stop da zaustaviš objavljivanje");
                        } else if (arguments[0] == "!announce" && !isNaN(arguments[1]) && arguments[2] != null) {
                            if (!bBot.room.announceActive) {
                                announceActivate(arguments, amsg);
                            } else {
                                announceStop(arguments, amsg);
                                announceActivate(arguments, amsg);
                            }

                        } else if (arguments[0] == "!announce" && arguments[1] == "stop") {
                            announceStop(arguments, amsg);
                        } else {
                            API.sendChat("/me @" + chat.un + " neispravna komanda! upiši !ap [nakon koliko minuta da se objavi poruka] [poruka] ili !announce stop da zaustaviš objavljivanje");
                        }

                        function getMessage(arguments) {
                            var stream = "";
                            for (i = 2; i < arguments.length; i++) {
                                stream += (' ' + arguments[i]);
                            }
                            return stream;
                        }

                        function announceStop(arguments, amsg) {
                            if (!bBot.settings.announceActive) {
                                API.sendChat("/me @" + chat.un + " objavljivanje je već ugašeno!");
                                return;
                            } else {
                                bBot.settings.announceActive = false;
                                bBot.settings.announceMessage = null;
                                bBot.settings.announceStartTime = null;
                                bBot.settings.announceTime = null;
                                API.sendChat("/me @" + chat.un + " Uspešno ugašeno objavljivanje!");
                                return;
                            }
                        }

                        function announceActivate(arguments, amsg) {
                            bBot.settings.announceActive = true;
                            bBot.settings.announceMessage = amsg;
                            bBot.settings.announceStartTime = Date.now();
                            bBot.settings.announceTime = arguments[1] * 60 * 1000;
                            API.sendChat("/me @" + chat.un + " Uspešno postavljeno objavljivanje.Približno svakih: " + arguments[1] + " minuta će se objaviti: " + amsg);
                            return;
                        }
                    }
                }
            },

            leaderboardCommand: {
                command: 'leaderboard',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'https://yugoslavia-music.github.io/leaderboard.html';
                        API.sendChat(subChat(bBot.chat.leaderboardlink, {
                            name: chat.un,
                            link: link
                        }));
                    }
                }
            },

            updatePropsCommand: {
                command: 'updateprops',
                rank: 'menager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        updateProps();
                        API.sendChat("/me Ažurirao sam listu rekvizita!");
                    }
                }
            },

            //quiz: mini igra (pitanje na svakoj pjesmi)
            //question 1: year the band/artist started? - 1 point (first correct answer -> active player)
            //question 2: country - 1 point (active player with max of 2 points)
            //throw the dices (bonus): 3 (your_score + 30), 6 (score x2), [!Q2] 7 (dj_score + 7), 9 (score x3)
            //
            //http://musicbrainz.org/ws/2/artist/?query=artist:pegazus&limit=1

            quizCommand: {
                command: 'quiz', //The command to be called.
                rank: 'bouncer', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxPoints = msg.substring(cmd.length + 1);
                        if (!isNaN(maxPoints) && maxPoints !== "") {
                            quizMaxpoints = maxPoints;
                        }
                        //reset 
                        quizBand = "";
                        quizYear = "";
                        quizCountry = "";
                        quizCycle = 1;
                        quizLastUID = null;
                        quizLastScore = 0;
                        quizUsers = [];
                        quizState = true;
                        API.sendChat("/me @djs Kviz je poceo! Pravila su: Kviz je postavljen na " + maxPoints + " poena za pobjedu. Trenutni DJ ne moze da ucestvuje. Treba da se odgovori na 2 pitanja. Na drugi pitanje mozes da odgovoris samo ako si pogodio na prvo.");
                    }
                }
            },

            weatherCommand: {
                command: 'weather', //The command to be called. With the standard command literal this would be: !bacon
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var parameter = msg.substring(lastSpace + 1);

                        simpleAJAXLib = {

                            init: function() {
                                this.fetchJSON("http://rss.accuweather.com/rss/liveweather_rss.asp?metric=1&locCode=" + parameter);
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                var temperature = results.query.results.rss.channel.item[0].description;
                                temperature = temperature.replace('<img src="', '').replace('">', '');
                                temperature = temperature.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
                                    var num = parseInt(numStr, 10); // read num as normal number
                                    return String.fromCharCode(num);
                                });
                                API.sendChat("/me @" + chat.un + " : " + temperature);
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            newsCommand: {
                command: 'news', //The command to be called. With the standard command literal this would be: !bacon
                rank: 'user', //Minimum user permission to use the command
                type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var parameter = msg.substring(lastSpace + 1);
                        var selectedRSSFeed = -1;

                        simpleAJAXLib = {

                            init: function() {
                                for (var i = 0; i < rssFeeds.length; i++) {
                                    //Match the parameter with the rssFeeds array. If non match, display the howto.
                                    if (parameter == rssFeeds[i][0]) {
                                        this.fetchJSON(rssFeeds[i][1]);
                                        selectedRSSFeed = i;
                                    } else if (selectedRSSFeed == -1 && rssFeeds.length - 1 == i) {
                                        var rssOptions = "/me Molim koristi kao jedne od sljedeci primjera (ie.'!news fudbal'): '" + rssFeeds[0][0] + "'";
                                        for (var i = 1; i < rssFeeds.length; i++) {
                                            rssOptions += ", '";
                                            rssOptions += rssFeeds[i][0];
                                            rssOptions += "'";
                                        }
                                        rssOptions += ".";
                                        API.sendChat(rssOptions);
                                    }
                                }
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                if (selectedRSSFeed != -1) {

                                    //var rNumber = Math.floor(Math.random()*rssFeeds[selectedRSSFeed][2]);
                                    if (rssFeeds[selectedRSSFeed][3] != rssFeeds[selectedRSSFeed][2] - 1) {
                                        rssFeeds[selectedRSSFeed][3] += 1;
                                    } else {
                                        rssFeeds[selectedRSSFeed][3] = 0;
                                    }

                                    var long_url = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].link;

                                    if (rssFeeds[selectedRSSFeed][0] === "oneliners") {
                                        var oneliner = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].description;
                                        oneliner = oneliner.replace('<![CDATA[', '').replace(']', '').replace('<p>', '').replace('</p>', '').replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                                        oneliner = oneliner.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
                                            var num = parseInt(numStr, 10); // read num as normal number
                                            return String.fromCharCode(num);
                                        });
                                        oneliner = oneliner.replace('/ +/', '');
                                        if (oneliner.length > 249) {
                                            var counter = 0;
                                            for (var x = 0; x < oneliner.length; x++) {
                                                setTimeout(function() {
                                                    API.sendChat("/me " + oneliner.substring(counter * 249, (counter + 1) * 249));
                                                    counter++;
                                                }, x * 2000);
                                            }
                                        } else {
                                            API.sendChat(
                                                oneliner
                                            );
                                        }
                                    } else if (rssFeeds[selectedRSSFeed][0] === "isles") {
                                        var islesDescr = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].description;
                                        var islesPart1 = islesDescr.substr(0, 200);

                                        API.sendChat(
                                            "/me " +
                                            results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].pubDate +
                                            " // " +
                                            islesPart1 +
                                            "..."
                                        );

                                    } else {
                                        API.sendChat(
                                            "/me " +
                                            results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].title +
                                            " (" +
                                            long_url +
                                            ")");
                                    }
                                }
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            artistinfoCommand: {
                command: 'artistinfo', //The command to be called.
                rank: 'user', //Minimum user permission to use the command
                type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {

                        simpleAJAXLib = {

                            init: function() {
                                var artist = API.getMedia().author;
                                var url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=b3cb78999a38750fc3d76c51ba2bf6bb&artist=' + artist.replace(/&/g, "%26").replace(/ /g, "%20") + '&autocorrect=1'
                                this.fetchJSON(url);
                            },

                            fetchJSON: function(url) {
                                var root = 'https://query.yahooapis.com/v1/public/yql?q=';
                                var yql = 'select * from xml where url="' + url + '"';
                                var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
                                document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
                            },

                            jsTag: function(url) {
                                var script = document.createElement('script');
                                script.setAttribute('type', 'text/javascript');
                                script.setAttribute('src', url);
                                return script;
                            },

                            display: function(results) {
                                //http://ws.audioscrobbler.com/2.0/?method=artist.gettopTags&artist=Blur&api_key=b3cb78999a38750fc3d76c51ba2bf6bb
                                //todo: character replace (ie. of mice & men -> &)
                                setTimeout(function() {
                                    try {
                                        var name;
                                        name = results.query.results.lfm.artist.name;

                                        var picture;
                                        picture = results.query.results.lfm.artist.image[3].content

                                        var genres;
                                        genres = results.query.results.lfm.artist.tags.tag[0].name;
                                        genres += ", ";
                                        genres += results.query.results.lfm.artist.tags.tag[1].name;
                                        genres += ", ";
                                        genres += results.query.results.lfm.artist.tags.tag[2].name;

                                        var similar;
                                        similar = results.query.results.lfm.artist.similar.artist[0].name;
                                        similar += ", ";
                                        similar += results.query.results.lfm.artist.similar.artist[1].name;
                                        similar += ", ";
                                        similar += results.query.results.lfm.artist.similar.artist[2].name;

                                        API.sendChat("/me [@" + chat.un + "] Ime: " + name + " // Zanr: " + genres + " // Slicno: " + similar + " " + picture);
                                    } catch (e) {
                                        API.sendChat("/me [@" + chat.un + "] Nažalost, last.fm nije pronašao nikakve oznake za ovaj bend.");
                                    }
                                }, 100);
                            }
                        }
                        simpleAJAXLib.init();
                    }
                }
            },

            mehautobanCommand: {
                command: 'mehautoban',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!bBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var limit;

                        if (msg.length === cmd.length) {
                            limit = 5;
                        } else {
                            limit = msg.substring(cmd.length + 1);
                            if (isNaN(limit)) {
                                return API.sendChat("/me @" + chat.un + "Neispravna komanda, upiši !mehautoban [limit], gdje je limit maksimalan broj mehova zaredom");
                            }
                        }
                        if (!bBot.settings.mehAutoBan) {
                            bBot.settings.mehAutoBan = true;
                            bBot.settings.mehAutoBanLimit = limit;
                            API.sendChat("/me Auto banovanje za uzastopno mehovanje uključeno! Limit uzastopnih mehova: " + limit);
                        } else {
                            bBot.settings.mehAutoBan = false;
                            API.sendChat("/me Auto banovanje za uzastopno mehovanje isključeno!");
                        }

                    }
                }
            }

        }
    };

    loadChat(bBot.startup);
}).call(this);
