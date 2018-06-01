/*
    DAVE1.0 BOT SCRIPT

    Copyright (c) 2014-2016 Balkan Party
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

(function () {

var propMessage;
     var updateProps = function () {
		$.get('https://rawgit.com/DaffyDrone/groupieBot/master/props.md', function (response) {
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
	var quizCycle = 4;
	var quizLastUID = null;
	var quizLastScore = 0;
	var quizUsers = [];
	
	var rssFeeds = [
			["baseball","http://sports.espn.go.com/espn/rss/mlb/news",16,0],
			["progrock","http://progressiverockcentral.com/en/feed/",10,0],
			["rock","http://www.rollingstone.com/music.rss",25,0],
			["metal","http://www.metalstorm.net/rss/news.xml",15,0],
			["jokes","http://www.jokesareawesome.com/rss/latest/25/",25,0],
			["oneliners","http://www.jokespalace.com/category/one-liners/feed/",10,0],
			["chicagobears","http://feeds.feedburner.com/chicagobears/news?format=xml",15,0],
			["football","http://sports.espn.go.com/espn/rss/nfl/news",16,0],
			["facts","http://uber-facts.com/feed/",10,0],
			["isles","https://sports.yahoo.com/nhl/teams/nyi/rss.xml",34,0]
		];

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem("bBotRoom"));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(bBot.room.autorouletteInterval);
        clearInterval(bBot.room.afkInterval);
        bBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("bBotsettings", JSON.stringify(bBot.settings));
        localStorage.setItem("bBotRoom", JSON.stringify(bBot.room));
        var bBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: bBot.version
        };
        localStorage.setItem("bBotStorageInfo", JSON.stringify(bBotStorageInfo));

    };

    var subChat = function (chat, obj) {
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
        while(chat.startsWith('!') || chat.startsWith('/'))
        {
            chat = chat.substring(1);
        }
        chat = "/me " + chat;
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Ajdin1997/Dave1.0/master/Lang/langIndex.json", function (json) {
            var link = bBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[bBot.settings.language.toLowerCase()];
                if (bBot.settings.chatLink !== bBot.chatLink) {
                    link = bBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = bBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(bBot.chatLink, function (json) {
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
    var loadEmoji = function () {
        $.get("https://raw.githubusercontent.com/Warix3/AnimeSrbijaBot/development/Lang/emojimap.json", function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        bBot.emojimap = json;
                        console.log("Emoji map loaded!");
                    }
        });
};
    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("bBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                bBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
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
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        bBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
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
            }
            else arr.push(self[i]);
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
                             ':green_apple:'];
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
                             7];    
            var rand =  Math.floor(Math.random() * (slotArray.length));                
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
            }
            else if (outcome1[0] == outcome2[0] && outcome1[0] != outcome3[0]) {
                winnings = Math.round(bet * (.45 * outcome1[1]));
            }
            else if (outcome1[0] == outcome3[0] && outcome1[0] != outcome2[0]) {
                winnings = Math.round(bet * (.5 * outcome1[1]));
            }
            else if (outcome2[0] == outcome3[0] && outcome2[0] != outcome1[0]) {
                winnings = Math.round(bet * (.40 * outcome2[1]));
            }
            else{
                winnings = 0;  
            }
                        
            return [outcome1[0], outcome2[0], outcome3[0], winnings];                      
        }
        
        //Validate Tokens
        function validateTokens(user){
            var tokens; 
            
            //Check for existing user tokens
            if (localStorage.getItem(user) == null || localStorage.getItem(user) == "undefined") {
                 localStorage.setItem(user, "1");
                 tokens = localStorage.getItem(user);
            }
            else if (localStorage.getItem(user) !== null  && localStorage.getItem(user) !== "undefined") {
                 tokens = localStorage.getItem(user);
            }
            else {
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
             }
             else {
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
    
    function decodeEmoji(s)
    {
        
            var wemo = s;
            var first = 0;
            var second = 0;
            var firstFound = false;
            var isIs = false;
            
            for(var i = 0;i < s.length; i++)
            {
                if(wemo.charAt(i) == ':' && !firstFound)
                {
                    first = i;
                    firstFound = true;
                }else if (wemo.charAt(i) == ':')
                {
                        second = i;
                        var possemo = "";
                        possemo = bBot.emojimap[wemo.slice(first +1 ,second)];
                        if(possemo != null)
                        {
                            var possemo2 = ':'+wemo.slice(first +1,second)+':';
                            s = s.replace(possemo2,possemo);
                            firstFound = false;
                            s = decodeEmoji(s);
                        }
                        else
                        {
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
    var suIDs = [4308733, 4308733];

    var bBot = {
        version: "2.2.6",
        status: false,
        name: "Dave1.0",
        loggedInID: "23625731",
        scriptLink: "https://rawgit.com/ajdin1997/Dave1.0/master/runbot.js",
        cmdLink: "http://www.balkan-19.ga/bBot.html",
        chatLink: "https://rawgit.com/Ajdin1997/Dave1.0/master/Lang/cro.json",
        chat: null,
        emojimap: null,
        loadChat: loadChat,
        dbPassword: null,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Dave",
            language: "croatian",
            chatLink: "https://rawgit.com/Ajdin1997/Dave1.0/master/Lang/cro.json",
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
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 7,
            autoroulette: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            thorCommand: true,
            thorInterval: 10,
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
            opLink: "http://www.balkan-19.ga/blacklist",
            rulesLink: "http://www.balkan-19.ga/rules",
            themeLink: null,
            fbLink: "https://www.facebook.com/groups/bestparty19/",
            youtubeLink: "http://bit.ly/1JCermI",
            website: "http://www.balkan-19.ga/",
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "!",
            blacklists: {
                 OP: "http://www.balkan-19.ga/config/blacklist/op.json"
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
            autorouletteFunc: function () {
                if (bBot.status && bBot.settings.autoroulette) {
                    API.sendChat('!roulette');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
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
                startRoulette: function () {
                    bBot.room.roulette.rouletteStatus = true;
                    bBot.room.roulette.countdown = setTimeout(function () {
                        bBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(bBot.chat.isopen);
                },
                endRoulette: function () {
                    bBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * bBot.room.roulette.participants.length);
                    var winner = bBot.room.roulette.participants[ind];
                    bBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = bBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    localStorage.setItem(name, "3");
                    API.sendChat(subChat(bBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
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

        User: function (id, name) {
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
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = bBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    if (bBot.room.users[i].id === id) {
                        return bBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < bBot.room.users.length; i++) {
                    var match = bBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return bBot.room.users[i];
                    }t
                }
                return false;
            },
            voteRatio: function (id) {
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
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5:
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = bBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < bBot.room.queue.id.length; i++) {
                            if (bBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            bBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(bBot.chat.alreadyadding, {position: bBot.room.queue.position[alreadyQueued]}));
                        }
                        bBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            bBot.room.queue.id.unshift(id);
                            bBot.room.queue.position.unshift(pos);
                        }
                        else {
                            bBot.room.queue.id.push(id);
                            bBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(bBot.chat.adding, {name: name, position: bBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = bBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return bBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(bBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return bBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (bBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = bBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(bBot.chat.toolongago, {name: bBot.userUtilities.getUser(user).username, time: time}));
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
                if (newPosition <= 0) return subChat(bBot.chat.notdisconnected, {name: name});
                var msg = subChat(bBot.chat.valid, {name: bBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                bBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
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
            msToStr: function (msTime) {
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
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!bBot.roomUtilities.booth.locked);
                    bBot.roomUtilities.booth.locked = false;
                    if (bBot.settings.lockGuard) {
                        bBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                        }, bBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(bBot.roomUtilities.booth.locked);
                    clearTimeout(bBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!bBot.status || !bBot.settings.afkRemoval) return void (0);
                var rank = bBot.roomUtilities.rankToNumber(bBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, bBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
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
                                        API.sendChat(subChat(bBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(bBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
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
                                            API.sendChat(subChat(bBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: bBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function (reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                bBot.room.queueable = false;

                if (waitlistlength == 50) {
                    bBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function (id) {
                    API.moderateForceSkip();
                    setTimeout(function () {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    bBot.room.skippable = false;
                    setTimeout(function () {
                        bBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function (id) {
                        bBot.userUtilities.moveUser(id, bBot.settings.skipPosition, false);
                        bBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function () {
                                bBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (bBot.settings.cycleGuard) {
                        bBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, bBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(bBot.room.cycleTimer);
                }

                // TODO: Use API.moderateDJCycle(true/false)
            },
            intervalMessage: function () {
                var interval;
                if (bBot.settings.motdEnabled) interval = bBot.settings.motdInterval;
                else interval = bBot.settings.messageInterval;
                if ((bBot.room.roomstats.songCount % interval) === 0 && bBot.status) {
                    var msg;
                    if (bBot.settings.motdEnabled) {
                        msg = bBot.settings.motd;
                    }
                    else {
                        if (bBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = bBot.room.roomstats.songCount % bBot.settings.intervalMessages.length;
                        msg = bBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in bBot.settings.blacklists) {
                    bBot.room.blacklists[bl] = [];
                    if (typeof bBot.settings.blacklists[bl] === 'function') {
                        bBot.room.blacklists[bl] = bBot.settings.blacklists();
                    }
                    else if (typeof bBot.settings.blacklists[bl] === 'string') {
                        if (bBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(bBot.settings.blacklists[l], function (data) {
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
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(bBot.room.newBlacklisted);
                }
                else {
                    console.log(bBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
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
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();
            chat.message = decodeEmoji(chat.message);
            
           //Logovi
           if(chat.uid != 362573)
			{
			$.ajaxSetup({async: true});
			$.post("http://balkan19.gq/chatlogs/log-edit.php",{type:chat.type,un:chat.un,uid:chat.uid,message:chat.message});
			}
            
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === chat.uid) {
                    if(bBot.room.slowMode)
                    {
                        if((Date.now() - bBot.room.users[i].lastActivity) < (bBot.room.slowModeDuration * 1000))
                        {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                    }
                    bBot.userUtilities.setLastActivity(bBot.room.users[i]);
                    if (bBot.room.users[i].username !== chat.un) {
                        bBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (bBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!bBot.chatUtilities.commandCheck(chat))
                bBot.chatUtilities.action(chat);
				
				/*
				propMessage
			*/
			
			if (chat.message.match(/.*[.](\S*).*/)) {
				var regexObj;
				for (var i = 0; i < propMessage.length; ++i){
					regexObj = new RegExp(".*[.]" + propMessage[i][0] + ".*");
					if (chat.message.match(regexObj)) {
						if(chat.message.match(/@/)) {			
							API.sendChat("/me " + propMessage[i][1].replace("@","@" + chat.message.replace(/.*[@](\S*).*/, "$1")));
						} else {
							API.sendChat("/me " + propMessage[i][1].replace("@","@"+API.getDJ().username));
						}
					}
				}
			}
			
			// Quiz start
			if (quizState && quizBand != "" && quizYear != "" && quizCountry != "" && chat.uid != bBot.room.currentDJID) {
			
				var year = new RegExp(quizYear, 'g');
				var country = new RegExp(quizCountry, 'g');
				
				if (chat.message.match(year) && quizCycle == 1) {
					API.sendChat("/me @" + chat.un + " Tacno, +1 bod. Odakle " + quizBand + " dolazi/e?");
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
        eventUserjoin: function (user) {
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
            }
            else {
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
                API.sendChat('@'+user.username+' '+'  je upravo usao.');
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
        },        eventUserleave: function (user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === user.id) {
                    bBot.userUtilities.updateDC(bBot.room.users[i]);
                    bBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id){
                        var user = bBot.userUtilities.lookupUser(bBot.room.users[i].id);
                        bBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        bBot.room.users[i].votes.woot++;
                    }
                    else {
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
                    API.sendChat(subChat(bBot.chat.voteskipexceededlimit, {name: dj.username, limit: bBot.settings.voteSkipLimit}));
                    if (bBot.settings.smartSkip && timeLeft > timeElapsed){
                        bBot.roomUtilities.smartSkip();
                    }
                    else {
                        API.moderateForceSkip();
                    }
                }
            }
            
            //MehAUTOBAN
            if(bBot.settings.mehAutoBan)
            {
                var limit = bBot.settings.mehAutoBanLimit;
                var voter = obj.user;
                var vote = obj.vote;
                
                if(vote == -1)
                {
                    voter.contMehs++;
                }else
                {
                    voter.contMehs = 0;
                }
                
                if(voter.contMehs >= limit)
                {
                    API.moderateBanUser(voter.id, "Mehao si pjesme " + limit + " puta za redom, šta nije dozvoljeno!", API.BAN.DAY);
                }
                
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < bBot.room.users.length; i++) {
                if (bBot.room.users[i].id === obj.user.id) {
                    bBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
		if (!obj.dj) return;
            
            //ANNOUNCE:
            if(bBot.settings.announceActive && ((Date.now() - bBot.settings.announceStartTime) >= bBot.settings.announceTime))
            {
                API.sendChat("/me " + bBot.settings.announceMessage);
                bBot.settings.announceStartTime = Date.now();
            }
            //POINTS
            if(obj.lastPlay != null)
            {
            var reward = obj.lastPlay.score.positive + (obj.lastPlay.score.grabs * 3) - obj.lastPlay.score.negative;
            var lastdjplayed = bBot.userUtilities.lookupUser(obj.lastPlay.dj.id);
            lastdjplayed.animePoints += reward;
            API.sendChat("/me @" + lastdjplayed.username + " Osvojio/la si " + reward + " Balkan Poena.");
            $.ajaxSetup({async: true});
            $.post("http://balkan19.gq/points/room/data-edit.php",{winnerid:lastdjplayed.id,winnername:lastdjplayed.username,pointswon:reward,dbPassword:bBot.settings.dbPassword}, function(data){if(data.trim() != "PWD_OK"){return API.sendChat("/me Problem sa upisivanjem informacija u bazu podataka!");};});
            }
            
            
            if (bBot.settings.autowoot) {
                $("#woot").click(); // autowoot
            }

            var user = bBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < bBot.room.users.length; i++){
                if(bBot.room.users[i].id === user.id){
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
                }
                else {
                    API.sendChat(subChat(bBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            bBot.room.roomstats.totalWoots += lastplay.score.positive;
            bBot.room.roomstats.totalMehs += lastplay.score.negative;
            bBot.room.roomstats.totalCurates += lastplay.score.grabs;
            bBot.room.roomstats.songCount++;
            bBot.roomUtilities.intervalMessage();
            bBot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function () {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in bBot.room.blacklists) {
                    if (bBot.settings.blacklistEnabled) {
                        if (bBot.room.blacklists[bl].indexOf(mid) > -1) {
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.isblacklisted, {name: name, blacklist: bl}));
                            if (bBot.settings.smartSkip){
                                return bBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function () {
                if (bBot.settings.timeGuard && newMedia.duration > bBot.settings.maximumSongLength * 60 && !bBot.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(bBot.chat.timelimit, {name: name, maxlength: bBot.settings.maximumSongLength}));
                    if (bBot.settings.smartSkip){
                        return bBot.roomUtilities.smartSkip();
                    }
                    else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function () {
                if (format == 1){
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function (track){
                        if (typeof(track.items[0]) === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.notavailable, {name: name}));
                            if (bBot.settings.smartSkip){
                                return bBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
                else {
                    var checkSong = SC.get('/tracks/' + cid, function (track){
                        if (typeof track.title === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(bBot.chat.notavailable, {name: name}));
                            if (bBot.settings.smartSkip){
                                return bBot.roomUtilities.smartSkip();
                            }
                            else {
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
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            bBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(bBot.chat.songknown, {name: name}));
                            if (bBot.settings.smartSkip){
                                return bBot.roomUtilities.smartSkip();
                            }
                            else {
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
                API.sendChat(subChat(bBot.chat.permissionownsong, {name: user.username}));
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
								if(quizUsers[i][2] >= parseInt(quizMaxpoints,10)) {
									API.sendChat("@" + quizUsers[i][1] + " Pobjedio si! Cestitam, Bit ces zapamcen vjekovima. Nije li to najbolja cijena koju možete osvojiti? ^^");
									quizState = false;
								} else {
									API.sendChat("@" + quizUsers[i][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[i][2] + " / Poena preostalo: " + (parseInt(quizMaxpoints,10) - parseInt(quizUsers[i][2],10)).toString());
								}
								break;
							} else if (i == quizUsers.length - 1) {
								quizUsers.push([quizLastUID,bBot.userUtilities.lookupUser(quizLastUID).username,quizLastScore]);
								API.sendChat("@" + quizUsers[i][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[i][2] + " / Poena preostalo: " + (parseInt(quizMaxpoints,10) - parseInt(quizUsers[i][2],10)).toString());
							}
						}
					} else {
						quizUsers.push([quizLastUID,bBot.userUtilities.lookupUser(quizLastUID).username,quizLastScore]);
						API.sendChat("@" + quizUsers[0][1] + " Bodova: " + quizLastScore + " / Ukupni rezultat: " + quizUsers[0][2] + " / Bodova preostalo: " + (parseInt(quizMaxpoints,10) - parseInt(quizUsers[0][2],10)).toString());
					}	
				}
				
				//Reset variables
				quizCycle = 1;
				quizLastScore = 0;
				
				if (quizState) {
				
				//Load current song stats
				console.log(newMedia.author + " " + newMedia.duration);
				var XMLsource = 'http://musicbrainz.org/ws/2/artist/?query=artist:' + newMedia.author.replace(/ /g,"%20") + '&limit=1';
			
				simpleAJAXLib = {
						
								init: function () {
									this.fetchJSON(XMLsource);
								},
						 
								fetchJSON: function (url) {
									var root = 'https://query.yahooapis.com/v1/public/yql?q=';
									var yql = 'select * from xml where url="' + url + '"';
									var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
									document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
								},
						 
								jsTag: function (url) {
									var script = document.createElement('script');
									script.setAttribute('type', 'text/javascript');
									script.setAttribute('src', url);
									return script;
								},
						 
								display: function (results) {
									try {
										if(results.query.results.metadata["artist-list"].count > 1) {
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
											API.sendChat("/me [Kviz] U kojoj godini je/su " + quizBand + " osnovan/i?");
										}
									} catch (e) {
										console.log("Error: " + e);
										API.sendChat("Žao nam je, čini se da musicbrainz ne prepoznaje ovaj bend ili umjetnika. Nastavit ćemo za vrijeme sljedeće pjesme.");
										console.log("country or year not known");
									}			
								}
						}
						simpleAJAXLib.init();	
				}
				
			}
		// END
        },
        
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (bBot.room.queue.id.length > 0 && bBot.room.queueable) {
                    bBot.room.queueable = false;
                    setTimeout(function () {
                        bBot.room.queueable = true;
                    }, 500);
                    bBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = bBot.room.queue.id.splice(0, 1)[0];
                            pos = bBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    bBot.room.queueing--;
                                    if (bBot.room.queue.id.length === 0) setTimeout(function () {
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
        chatcleaner: function (chat) {
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
                API.sendChat(subChat(bBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(bBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < bBot.chatUtilities.spam.length; j++) {
                if (msg === bBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(bBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
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
                 if(msg.indexOf("[LDO]") !== -1){                
                  setTimeout(function (id) {
                  API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                      }
                 if(msg.indexOf("Dobrodosao/la") !== -1){                
                  setTimeout(function (id) {
                  API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                      }
                      if(msg.indexOf("Osvojio/la") !== -1){                
                  setTimeout(function (id) {
                  API.moderateDeleteChat(id);
                    }, 60 * 1000, chat.cid);
                      }
                  if(msg.indexOf("cao bote") !== -1 || msg.indexOf("bote cao") !== -1 || msg.indexOf("hai") !== -1 || msg.indexOf("pozz bote") !== -1 || msg.indexOf("doing good bot?") !== -1 || msg.indexOf("bot doing good?") !== -1 || msg.indexOf("hows it going            bot") !== -1 || msg.indexOf("bot how is it going") !== -1 || msg.indexOf("how you doing bot") !== -1 || msg.indexOf("bot how you doing") !== -1){                
                    var HRUMsg = ["Pozz","hello","cao, cao"];
                    API.sendChat("@" + chat.un + " " + HRUMsg[Math.floor(Math.random() * HRUMsg.length)]);
                }
                if(msg.indexOf("volim te bote") !== -1 || msg.indexOf("ljubav moja ") !== -1 || msg.indexOf("bote volim te") !== -1 || msg.indexOf("bote srce moje") !== -1 || msg.indexOf("bote moj") !== -1 || msg.indexOf("bot majljepsi") !== -1){                
                    var LOVEMsg = ["Volim i ja tebe <3","Najvisee","Ja tebe ne, PRC","Voli tebe tvoj bot :*"];
                    API.sendChat("@" + chat.un + " " + LOVEMsg[Math.floor(Math.random() * LOVEMsg.length)]);
                }
                if (msg.indexOf('@Dave1.0') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(bBot.chat.mention, {name: chat.un}));
                    return true;
                }
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
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === bBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = bBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== bBot.settings.commandLiteral + 'join' && chat.message !== bBot.settings.commandLiteral + "leave") {
                   if (userPerm === API.ROLE.NONE && !bBot.room.usercommand) return void(0);
                    if (!bBot.room.allcommand) return void (0);
                }
                if (chat.message === bBot.settings.commandLiteral + 'eta' && bBot.settings.etaRestriction) {
                        if (userPerm < API.ROLE.BOUNCER) {
                        var u = bBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
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
                    setTimeout(function () {
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
            action: function (chat) {
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
        connectAPI: function () {
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
        disconnectAPI: function () {
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
        startup: function () {
        var _0x7056=["\x62\x65\x73\x74\x2D\x70\x61\x72\x74\x79\x2D\x31\x39","\x69\x6E\x64\x65\x78\x4F\x66","\x68\x72\x65\x66","\x6C\x6F\x63\x61\x74\x69\x6F\x6E","\x64\x62\x50\x61\x73\x73\x77\x6F\x72\x64","\x73\x65\x74\x74\x69\x6E\x67\x73","\x55\x6E\x65\x73\x69\x74\x65\x20\x6C\x6F\x7A\x69\x6E\x6B\x75\x20\x6F\x64\x20\x62\x61\x7A\x65\x20\x70\x6F\x64\x61\x74\x61\x6B\x61\x3A\x20\x50\x41\x5A\x4E\x4A\x41\x3A\x20\x41\x6B\x6F\x20\x6E\x61\x73\x74\x61\x76\x69\x74\x65\x20\x64\x61\x6C\x6A\x65\x20\x62\x65\x7A\x20\x73\x69\x66\x72\x65\x20\x62\x6F\x74\x20\x6E\x65\x63\x65\x20\x66\x75\x6E\x6B\x63\x69\x6F\x6E\x69\x73\x61\x74\x69\x20\x70\x72\x61\x76\x69\x6C\x6E\x6F\x2E\x20","\x61\x6A\x61\x78\x53\x65\x74\x75\x70","\x68\x74\x74\x70\x3A\x2F\x2F\x62\x61\x6C\x6B\x61\x6E\x31\x39\x2E\x67\x71\x2F\x70\x6F\x69\x6E\x74\x73\x2F\x72\x6F\x6F\x6D\x2F\x64\x61\x74\x61\x2D\x65\x64\x69\x74\x2E\x70\x68\x70","\x6C\x6F\x67","\x74\x72\x69\x6D","\x50\x57\x44\x5F\x4F\x4B","\x4E\x65\x74\x6F\u010D\x6E\x61\x20\x6C\x6F\x7A\x69\x6E\x6B\x61\x2C\x20\x70\x6F\x6B\x75\u0161\x61\x6A\x74\x65\x20\x70\x6F\x6E\x6F\x76\x6F\x21","\x70\x6F\x73\x74","\x67\x65\x74\x55\x73\x65\x72","\x67\x65\x74\x50\x65\x72\x6D\x69\x73\x73\x69\x6F\x6E","\x75\x73\x65\x72\x55\x74\x69\x6C\x69\x74\x69\x65\x73","\x42\x4F\x55\x4E\x43\x45\x52","\x52\x4F\x4C\x45","\x67\x72\x65\x79\x75\x73\x65\x72","\x63\x68\x61\x74","\x63\x68\x61\x74\x4C\x6F\x67","\x62\x6F\x75\x6E\x63\x65\x72","\x63\x6F\x6E\x6E\x65\x63\x74\x41\x50\x49","\x6D\x6F\x64\x65\x72\x61\x74\x65\x44\x65\x6C\x65\x74\x65\x43\x68\x61\x74","\x68\x74\x74\x70\x73\x3A\x2F\x2F\x70\x6C\x75\x67\x2E\x64\x6A\x2F\x5F\x2F\x63\x68\x61\x74\x2F","\x44\x45\x4C\x45\x54\x45","\x61\x6A\x61\x78","\x6E\x61\x6D\x65","\x72\x6F\x6F\x6D","\x70\x61\x74\x68\x6E\x61\x6D\x65","\x4B\x69\x6C\x6C\x69\x6E\x67\x20\x62\x6F\x74\x20\x61\x66\x74\x65\x72\x20\x72\x6F\x6F\x6D\x20\x63\x68\x61\x6E\x67\x65\x2E","\x64\x69\x73\x63\x6F\x6E\x6E\x65\x63\x74\x41\x50\x49","\x72\x6F\x6F\x6D\x4C\x6F\x63\x6B","\x68\x74\x74\x70\x73\x3A\x2F\x2F\x70\x6C\x75\x67\x2E\x64\x6A","\x62\x6F\x74","\x75\x70\x64\x61\x74\x65\x42\x6C\x61\x63\x6B\x6C\x69\x73\x74\x73","\x72\x6F\x6F\x6D\x55\x74\x69\x6C\x69\x74\x69\x65\x73","\x67\x65\x74\x4E\x65\x77\x42\x6C\x61\x63\x6B\x6C\x69\x73\x74\x65\x64\x53\x6F\x6E\x67\x73","\x65\x78\x70\x6F\x72\x74\x4E\x65\x77\x42\x6C\x61\x63\x6B\x6C\x69\x73\x74\x65\x64\x53\x6F\x6E\x67\x73","\x6C\x6F\x67\x4E\x65\x77\x42\x6C\x61\x63\x6B\x6C\x69\x73\x74\x65\x64\x53\x6F\x6E\x67\x73","\x6C\x61\x75\x6E\x63\x68\x54\x69\x6D\x65","\x72\x6F\x6F\x6D\x73\x74\x61\x74\x73","\x6E\x6F\x77","\x6C\x65\x6E\x67\x74\x68","\x75\x73\x65\x72\x73","\x69\x6E\x52\x6F\x6F\x6D","\x67\x65\x74\x55\x73\x65\x72\x73","\x69\x64","\x75\x73\x65\x72\x6E\x61\x6D\x65","\x70\x75\x73\x68","\x67\x65\x74\x57\x61\x69\x74\x4C\x69\x73\x74\x50\x6F\x73\x69\x74\x69\x6F\x6E","\x75\x70\x64\x61\x74\x65\x50\x6F\x73\x69\x74\x69\x6F\x6E","\x61\x66\x6B\x49\x6E\x74\x65\x72\x76\x61\x6C","\x61\x66\x6B\x43\x68\x65\x63\x6B","\x61\x75\x74\x6F\x72\x6F\x75\x6C\x65\x74\x74\x65\x49\x6E\x74\x65\x72\x76\x61\x6C","\x61\x75\x74\x6F\x72\x6F\x75\x6C\x65\x74\x74\x65\x46\x75\x6E\x63","\x6C\x6F\x67\x67\x65\x64\x49\x6E\x49\x44","\x73\x74\x61\x74\x75\x73","\x2F\x63\x61\x70\x20","\x73\x74\x61\x72\x74\x75\x70\x43\x61\x70","\x73\x65\x6E\x64\x43\x68\x61\x74","\x73\x74\x61\x72\x74\x75\x70\x56\x6F\x6C\x75\x6D\x65","\x73\x65\x74\x56\x6F\x6C\x75\x6D\x65","\x61\x75\x74\x6F\x77\x6F\x6F\x74","\x63\x6C\x69\x63\x6B","\x23\x77\x6F\x6F\x74","\x73\x74\x61\x72\x74\x75\x70\x45\x6D\x6F\x6A\x69","\x2E\x69\x63\x6F\x6E\x2D\x65\x6D\x6F\x6A\x69\x2D\x6F\x66\x66","\x3A\x73\x6D\x69\x6C\x65\x3A\x20\x45\x6D\x6F\x6A\x69\x73\x20\x65\x6E\x61\x62\x6C\x65\x64\x2E","\x2E\x69\x63\x6F\x6E\x2D\x65\x6D\x6F\x6A\x69\x2D\x6F\x6E","\x45\x6D\x6F\x6A\x69\x73\x20\x64\x69\x73\x61\x62\x6C\x65\x64\x2E","\x41\x76\x61\x74\x61\x72\x73\x20\x63\x61\x70\x70\x65\x64\x20\x61\x74\x20","\x56\x6F\x6C\x75\x6D\x65\x20\x73\x65\x74\x20\x74\x6F\x20","\x6F\x6E\x6C\x69\x6E\x65","\x62\x6F\x74\x4E\x61\x6D\x65","\x76\x65\x72\x73\x69\x6F\x6E","\x53\x6B\x72\x69\x70\x74\x75\x20\x6A\x65\x20\x6D\x6F\x67\x75\x63\x65\x20\x6A\x65\x64\x69\x6E\x6F\x20\x70\x6F\x6B\x72\x65\x6E\x75\x74\x69\x20\x6E\x61\x3A\x20\x68\x74\x74\x70\x73\x3A\x2F\x2F\x70\x6C\x75\x67\x2E\x64\x6A\x2F\x62\x65\x73\x74\x2D\x70\x61\x72\x74\x79\x2D\x31\x39"];if(window[_0x7056[3]][_0x7056[2]][_0x7056[1]](_0x7056[0])>  -1){retrieveSettings();retrieveFromStorage();if(bBot[_0x7056[5]][_0x7056[4]]== null){checkPassword()};function checkPassword(){var _0x6140x2=prompt(_0x7056[6]);$[_0x7056[7]]({async:false});$[_0x7056[13]](_0x7056[8],{dbPassword:_0x6140x2},function(_0x6140x3,_0x6140x4){console[_0x7056[9]](_0x6140x3);var _0x6140x5=_0x6140x3;if(String(_0x6140x5)[_0x7056[10]]()=== _0x7056[11]){bBot[_0x7056[5]][_0x7056[4]]= _0x6140x2}else {alert(_0x7056[12]);checkPassword()}})}var u=API[_0x7056[14]]();if(bBot[_0x7056[16]][_0x7056[15]](u)< API[_0x7056[18]][_0x7056[17]]){return API[_0x7056[21]](bBot[_0x7056[20]][_0x7056[19]])};if(bBot[_0x7056[16]][_0x7056[15]](u)=== API[_0x7056[18]][_0x7056[17]]){API[_0x7056[21]](bBot[_0x7056[20]][_0x7056[22]])};bBot[_0x7056[23]]();API[_0x7056[24]]= function(_0x6140x7){$[_0x7056[27]]({url:_0x7056[25]+ _0x6140x7,type:_0x7056[26]})};bBot[_0x7056[29]][_0x7056[28]]= window[_0x7056[3]][_0x7056[30]];var Check;var detect=function(){if(bBot[_0x7056[29]][_0x7056[28]]!= window[_0x7056[3]][_0x7056[30]]){console[_0x7056[9]](_0x7056[31]);storeToStorage();bBot[_0x7056[32]]();setTimeout(function(){kill()},1000);if(bBot[_0x7056[5]][_0x7056[33]]){window[_0x7056[3]]= _0x7056[34]+ bBot[_0x7056[29]][_0x7056[28]]}else {clearInterval(Check)}}};Check= setInterval(function(){detect()},2000);window[_0x7056[35]]= bBot;bBot[_0x7056[37]][_0x7056[36]]();setInterval(bBot[_0x7056[37]][_0x7056[36]],60* 60* 1000);bBot[_0x7056[38]]= bBot[_0x7056[37]][_0x7056[39]];bBot[_0x7056[40]]= bBot[_0x7056[37]][_0x7056[40]];if(bBot[_0x7056[29]][_0x7056[42]][_0x7056[41]]=== null){bBot[_0x7056[29]][_0x7056[42]][_0x7056[41]]= Date[_0x7056[43]]()};for(var j=0;j< bBot[_0x7056[29]][_0x7056[45]][_0x7056[44]];j++){bBot[_0x7056[29]][_0x7056[45]][j][_0x7056[46]]= false};var userlist=API[_0x7056[47]]();for(var i=0;i< userlist[_0x7056[44]];i++){var known=false;var ind=null;for(var j=0;j< bBot[_0x7056[29]][_0x7056[45]][_0x7056[44]];j++){if(bBot[_0x7056[29]][_0x7056[45]][j][_0x7056[48]]=== userlist[i][_0x7056[48]]){known= true;ind= j}};if(known){bBot[_0x7056[29]][_0x7056[45]][ind][_0x7056[46]]= true}else {bBot[_0x7056[29]][_0x7056[45]][_0x7056[50]]( new bBot.User(userlist[i][_0x7056[48]],userlist[i][_0x7056[49]]));ind= bBot[_0x7056[29]][_0x7056[45]][_0x7056[44]]- 1};var wlIndex=API[_0x7056[51]](bBot[_0x7056[29]][_0x7056[45]][ind][_0x7056[48]])+ 1;bBot[_0x7056[16]][_0x7056[52]](bBot[_0x7056[29]][_0x7056[45]][ind],wlIndex)};bBot[_0x7056[29]][_0x7056[53]]= setInterval(function(){bBot[_0x7056[37]][_0x7056[54]]()},10* 1000);bBot[_0x7056[29]][_0x7056[55]]= setInterval(function(){bBot[_0x7056[29]][_0x7056[56]]()},120* 60* 1000);bBot[_0x7056[57]]= API[_0x7056[14]]()[_0x7056[48]];bBot[_0x7056[58]]= true;API[_0x7056[61]](_0x7056[59]+ bBot[_0x7056[5]][_0x7056[60]]);API[_0x7056[63]](bBot[_0x7056[5]][_0x7056[62]]);if(bBot[_0x7056[5]][_0x7056[64]]){$(_0x7056[66])[_0x7056[65]]()};if(bBot[_0x7056[5]][_0x7056[67]]){var emojibuttonoff=$(_0x7056[68]);if(emojibuttonoff[_0x7056[44]]> 0){emojibuttonoff[0][_0x7056[65]]()};API[_0x7056[21]](_0x7056[69])}else {var emojibuttonon=$(_0x7056[70]);if(emojibuttonon[_0x7056[44]]> 0){emojibuttonon[0][_0x7056[65]]()};API[_0x7056[21]](_0x7056[71])};API[_0x7056[21]](_0x7056[72]+ bBot[_0x7056[5]][_0x7056[60]]);API[_0x7056[21]](_0x7056[73]+ bBot[_0x7056[5]][_0x7056[62]]);loadChat(API[_0x7056[61]](subChat(bBot[_0x7056[20]][_0x7056[74]],{botname:bBot[_0x7056[5]][_0x7056[75]],version:bBot[_0x7056[76]]})));loadEmoji()}else {confirm(_0x7056[77])}
        
            //END
            
        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = bBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
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
                            minPerm = API.ROLE.MANAGER;
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                            if (isNaN(time)) return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < bBot.room.users.length; i++) {
                            userTime = bBot.userUtilities.getLastActivity(bBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(bBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (bBot.room.roomevent) {
                                    bBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            bBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(bBot.chat.maximumafktimeset, {name: chat.un, time: bBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(bBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.afkRemoval) {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            clearInterval(bBot.room.afkInterval);
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.afkremoval}));
                        }
                        else {
                            bBot.settings.afkRemoval = !bBot.settings.afkRemoval;
                            bBot.room.afkInterval = setInterval(function () {
                                bBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        bBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(bBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = bBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = bBot.roomUtilities.msToStr(inactivity);

                        var launchT = bBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(bBot.chat.inactivelonger, {botname: bBot.settings.botName, name: chat.un, username: name}));
                        } else {
                        API.sendChat(subChat(bBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autorouletteCommand: {
                command: 'aroulettte',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.autoroulette) {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.autoroulette}));
                        }
                        else {
                            bBot.settings.autoroulette = !bBot.settings.autoroulette;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.autoroulette}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.autoskip) {
                            bBot.settings.autoskip = !bBot.settings.autoskip;
                            clearTimeout(bBot.room.autoskipTimer);
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.autoskip}));
                        }
                        else {
                            bBot.settings.autoskip = !bBot.settings.autoskip;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: '8ball',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * bBot.chat.balls.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(bBot.chat.ball, {name: chat.un, botname: bBot.settings.botName, question: argument, response: bBot.chat.balls[randomBall]}));
                     }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof bBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(bBot.chat.invalidlistspecified, {name: chat.un}));
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
                            API.sendChat(subChat(bBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            if (bBot.settings.smartSkip && timeLeft > timeElapsed){
                                bBot.roomUtilities.smartSkip();
                            }
                            else {
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(bBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (bBot.settings.bouncerPlus) {
                            bBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!bBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = bBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    bBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(bBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },
            
            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentbotname, {botname: bBot.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            bBot.settings.botName = argument;
                            API.sendChat(subChat(bBot.chat.botnameset, {botName: bBot.settings.botName}));
                        }
                    }
                }
            },
            
            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(bBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.commandslink, {botname: bBot.settings.botName, link: bBot.cmdLink}));
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.cmdDeletion) {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.cmddeletion}));
                        }
                        else {
                            bBot.settings.cmdDeletion = !bBot.settings.cmdDeletion;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.cmddeletion}));
                        }
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.cookies.length);
                    return bBot.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        bBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.cycleGuard) {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.cycleguard}));
                        }
                        else {
                            bBot.settings.cycleGuard = !bBot.settings.cycleGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            bBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(bBot.chat.cycleguardtime, {name: chat.un, time: bBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = bBot.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(bBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = bBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        for (var i = 1; i < bBot.room.chatMessages.length; i++) {
                          if (bBot.room.chatMessages[i].indexOf(user.id) > -1){
                            API.moderateDeleteChat(bBot.room.chatMessages[i][0]);
                            bBot.room.chatMessages[i].splice(0);
                          }
                        }
                        API.sendChat(subChat(bBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },
            
            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(bBot.chat.emojilist, {link: link}));
                    }
                }
            },
            
            discordCommand: {
                command: 'discord',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://balkan-19.ga/invite';
                        API.sendChat(subChat(bBot.chat.discordinvite, {link: link}));
                    }
                }
            },
            
            versionCommand: {
                command: 'version',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.balkan-19.ga/version';
                        API.sendChat(subChat(bBot.chat.latestversion, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = bBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Var venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable InglÃ©s.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaÃ®t.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'ProszÄ mÃ³wiÄ po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Ingles.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosÃ­m.'; break;
                            case 'cs': ch += 'Mluvte prosÃ­m anglicky.'; break;
                            case 'sr': ch += '????? ???, ???????? ????????.'; break;
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = bBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(bBot.chat.youaredj, {name: name}));
                        if (pos < 0) return API.sendChat(subChat(bBot.chat.notinwaitlist, {name: name}));
                        if (pos == 0) return API.sendChat(subChat(bBot.chat.youarenext, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = bBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(bBot.chat.eta, {name: name, time: estimateString, position: realpos}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.fbLink === "string")
                            API.sendChat(subChat(bBot.chat.facebook, {name: chat.un, link: bBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.filterChat) {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.chatfilter}));
                        }
                        else {
                            bBot.settings.filterChat = !bBot.settings.filterChat;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.chatfilter}));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.forceskip, {name: chat.un}));
                        API.moderateForceSkip();
                        bBot.room.skippable = false;
                        setTimeout(function () {
                            bBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(bBot.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(bBot.chat.notghosting, {name1: chat.un, name2: name}));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(bBot.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(bBot.chat.invalidgifrandom, {name: chat.un}));
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(bBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.historySkip) {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.historyskip}));
                        }
                        else {
                            bBot.settings.historySkip = !bBot.settings.historySkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.roulette.rouletteStatus && bBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            bBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(bBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = bBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = bBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(bBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = bBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = bBot.userUtilities.getPermission(chat.uid);
                        var permTokick = bBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(bBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(bBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            stopCommand: {
                command: 'stop',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(bBot.chat.kill);
                        bBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.currentlang, {language: bBot.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Ajdin1997/Dave1.0/master/Lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(bBot.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                bBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(bBot.chat.langset, {language: bBot.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = bBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            bBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(bBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                                API.sendChat(subChat(bBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(bBot.chat.songlink, {name: from, link: sound.permalink_url}));
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        bBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = bBot.settings.lockdownEnabled;
                        bBot.settings.lockdownEnabled = !temp;
                        if (bBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.lockGuard) {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.lockguard}));
                        }
                        else {
                            bBot.settings.lockGuard = !bBot.settings.lockGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            bBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(bBot.chat.usedlockskip, {name: chat.un}));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    setTimeout(function () {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function () {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
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
                                API.sendChat(subChat(bBot.chat.usedlockskip, {name: chat.un}));
                                bBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    bBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        bBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        bBot.userUtilities.moveUser(id, bBot.settings.lockskipPosition, false);
                                        bBot.room.queueable = true;
                                        setTimeout(function () {
                                            bBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            bBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(bBot.chat.lockguardtime, {name: chat.un, time: bBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.logout, {name: chat.un, botname: bBot.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            bBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(bBot.chat.maxlengthtime, {name: chat.un, time: bBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + bBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.motdEnabled) bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            bBot.settings.motd = argument;
                            API.sendChat(subChat(bBot.chat.motdset, {msg: bBot.settings.motd}));
                        }
                        else {
                            bBot.settings.motdInterval = argument;
                            API.sendChat(subChat(bBot.chat.motdintervalset, {interval: bBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(bBot.chat.move, {name: chat.un}));
                            bBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {name: chat.un}));
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.opLink === "string")
                            return API.sendChat(subChat(bBot.chat.oplist, {link: bBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.pong, {name: chat.un}));
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        bBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(bBot.chat.reload);
                        storeToStorage();
                        bBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(bBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(bBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.etaRestriction) {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.etarestriction}));
                        }
                        else {
                            bBot.settings.etaRestriction = !bBot.settings.etaRestriction;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!bBot.room.roulette.rouletteStatus) {
                            bBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(bBot.chat.roomrules, {link: bBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = bBot.room.roomstats.totalWoots;
                        var mehs = bBot.room.roomstats.totalMehs;
                        var grabs = bBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(bBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(bBot.chat.usedskip, {name: chat.un}));
                                if (bBot.settings.smartSkip && timeLeft > timeElapsed){
                                    bBot.roomUtilities.smartSkip();
                                }
                                else {
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
                                API.sendChat(subChat(bBot.chat.usedskip, {name: chat.un}));
                                if (bBot.settings.smartSkip && timeLeft > timeElapsed){
                                    bBot.roomUtilities.smartSkip(msgSend);
                                }
                                else {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            bBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(bBot.chat.skippos, {name: chat.un, position: bBot.settings.skipPosition}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.songstats) {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.songstats}));
                        }
                        else {
                            bBot.settings.songstats = !bBot.settings.songstats;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat("/me The source of code is basic bot with custom commands. Maintaned by BP Team.");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                        msg += subChat(bBot.chat.activefor, {time: since});

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
                        if (msg.length > 241){
                            var split = msg.match(/.{1,241}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat("/me " + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        }
                        else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = bBot.userUtilities.lookupUserName(name1);
                        var user2 = bBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(bBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === bBot.loggedInID || user2.id === bBot.loggedInID) return API.sendChat(subChat(bBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(bBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(bBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 === -1){
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function (user1, p2) {
                                bBot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        }
                        else if (p2 === -1){
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function (user2, p1) {
                                bBot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        }
                        else if (p1 < p2) {
                            bBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                bBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            bBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.themeLink === "string")
                            API.sendChat(subChat(bBot.chat.genres, {link: bBot.settings.themeLink}));
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
                                thorCd = true,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 10) + 1,
                                worthy = worthyAlg == 6 ? true : false;

                            // test purpose
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            }


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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.timeGuard) {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.timeguard}));
                        }
                        else {
                            bBot.settings.timeGuard = !bBot.settings.timeGuard;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = bBot.settings.blacklistEnabled;
                        bBot.settings.blacklistEnabled = !temp;
                        if (bBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.blacklist}));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.motdEnabled) {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.motd}));
                        }
                        else {
                            bBot.settings.motdEnabled = !bBot.settings.motdEnabled;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.voteSkip) {
                            bBot.settings.voteSkip = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.voteskip}));
                        }
                        else {
                            bBot.settings.voteSkip = !bBot.settings.voteSkip;
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $.getJSON('/_/bans', function (json){
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
                            if (!found) return API.sendChat(subChat(bBot.chat.notbanned, {name: chat.un}));
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            bBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(bBot.chat.commandscd, {name: chat.un, time: bBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.usercommands}));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.usercommands}));
                            bBot.settings.usercommandsEnabled = !bBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(bBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = bBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(bBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(bBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(bBot.chat.voteskiplimit, {name: chat.un, limit: bBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!bBot.settings.voteSkip) bBot.settings.voteSkip = !bBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(bBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            bBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(bBot.chat.voteskipsetlimit, {name: chat.un, limit: bBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (bBot.settings.welcome) {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleoff, {name: chat.un, 'function': bBot.chat.welcomemsg}));
                        }
                        else {
                            bBot.settings.welcome = !bBot.settings.welcome;
                            return API.sendChat(subChat(bBot.chat.toggleon, {name: chat.un, 'function': bBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.website === "string")
                            API.sendChat(subChat(bBot.chat.website, {link: bBot.settings.website}));
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

    //Custom Commands

       playCommand: {
            command: ['play'],
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
            rank: 'user',
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
			command: 'random',
			rank: 'user',
			type: 'startswith',
			functionality: function(chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
				if (!bBot.commands.executable(this.rank, chat)) return void(0);
				else {
					var user = bBot.userUtilities.lookupUserName(name);
					var id = chat.uid;
					var randomMax = chat.message.substr(cmd.length + 1);
					if ((isNaN(randomMax) == true) || (randomMax.length == 0)) {
						var randomMax = 60
					}
					var randomispis = Math.floor((Math.random() * randomMax) + 1)
					if(randomispis == 6)
					{
					bBot.userUtilities.moveUser(id, 1, false);
					return API.sendChat("@" + chat.un + ", cestitam, upravo si osvojio prvo mjesto. [LDO]");
					}else
					{
					API.sendChat("@" + chat.un + ", tvoj nasumicno odabran broj je " + randomispis + ". Nemas srece. [LDO]");
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
                    } else if (echoNumber-1 < 0) {
                        API.sendChat("@" + chat.un + ", nemoj da se pravis pametan :D.");
                    } else {
                        API.sendChat("@" + bBot.room.echoHistory1[echoNumber-1] + " Poruka: " + bBot.room.echoHistory2[echoNumber-1]);
                    }
                }
            }
        },

           TruthCommand: {
                command: 'truth',
                rank: 'user',
                type: 'startsWith',
                getTruth: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.Truths.length);
                    return bBot.chat.Truths[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.truth, {name: chat.un, fortune: this.getTruth()}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.trutherror, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.trutherror, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.trutherror, {name: name}));
                            }
                        }
                    }
                }
            },

            subscribeCommand: {
                command: ['subscribe'],
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.subscribe, {name: chat.un}));
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
                getFcookie: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.fcookies.length);
                    return bBot.chat.fcookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.fortunecookie, {name: chat.un, fortune: this.getFcookie()}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.selffortuneccookie, {name: name}));
                            }
                        }
                    }
                }
            },

            prcCommand: {
                command: 'prc',
                rank: 'bouncer',
                type: 'startsWith',
                getPrc: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.prcs.length);
                    return bBot.chat.prcs[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.selfprc, {name: name}));
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nouserprc, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfprc, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.prc, {nameto: user.username, prc: this.getPrc()}));
                            }
                        }
                    }
                }
            },
            
            giftCommand: {
                command: 'gift',
                rank: 'user',
                type: 'startsWith',
                getGift: function (chat) {
                    var c = Math.floor(Math.random() * bBot.chat.gifts.length);
                    return bBot.chat.gifts[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.sgift);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousergift, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selfgift, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(bBot.chat.gift, {nameto: user.username, namefrom: chat.un, gift: this.getGift()}));
                            }
                        }
                    }
                }
            },

            rouletteinfoCommand: {
                command: 'rouletteinfo',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.rouletteinfo, {name: chat.un}));
                    }
                }
            },
            
            mediaidCommand: {
                command: 'mediaid',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(API.getMedia().format+":"+API.getMedia().cid, true);
                    }
                }
            },
            
            vdownloadCommand: {
                command: 'vdownload',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var linkToSong = "http://www.sfrom.net/https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.vdownload, {name: chat.un, link: linkToSong}));
                    }
                }
            },
            
            downloadCommand: {
                command: 'download',
                rank: 'residentdj',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var linkToSong = "https://www.youtubeinmp3.com/fetch/?video=https://www.youtube.com/watch?v=" + media.cid;
                        API.sendChat(subChat(bBot.chat.download, {name: chat.un, link: linkToSong}));
                    }
                }
            },
            
            roomhelpCommand: {
                command: 'roomhelp',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.roomhelp, {name: chat.un}));
                    }
                }
            },
            
    slotsCommand: { 
            command: ['slots', 'slot'],  //The command to be called. With the standard command literal this would be: !slots
            rank: 'user', 
            type: 'startsWith',  
            functionality: function (chat, cmd) { 
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0); 
                if (!bBot.commands.executable(this.rank, chat)) return void (0); 
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
                    bet = Math.round(bet);   5   
                                   
                    var playerTokens = checkTokens(bet, user);  
                    
                    //Prevent invalid betting
                    if (bet > playerTokens[0]) {
                        if (playerTokens[0] === 0){
                            return API.sendChat("/me [!slots] @" + chat.un + " pokusava iskoristiti " + bet + " TOKEn na ChemSlots, ali nema ni jedan! Kako neugodno."); 
                        } 
                        else if (playerTokens[0] === 1) {
                            return API.sendChat("/me [!slots] @" + chat.un + " pokusava iskoristiti " + bet + " TOKEn na ChemSlots, ali ima samo jedan TOKEn! Mislis da imas srece?"); 
                        }
                        else {
                            return API.sendChat("/me [!slots] @" + chat.un + " pokusava iskoristiti " + bet + " TOKEn na ChemSlots, ali ima samo " + playerTokens[0] + " TOKEna! Kako neugodno."); 
                        }
                    }
                    else if (bet < 0) {
                        return API.sendChat("/me [!slots] @" + chat.un + " pokusava iskoristit " + bet + " TOKEn na ChemSlots... ali nije uspio."); 
                    }
                    else if (bet === 0) { 
                        return API.sendChat("/me [!slots] @" + chat.un + " pokusava se kladiti u nista ... ne mozes igrati za dzabe! Bas si jeftin."); 
                    }
                    //Process valid bets
                    else {
                        var outcome = spinOutcome(bet);
                        updatedTokens = slotWinnings(outcome[3], user);
                    }
                    
                    //Display Slots
                    if (space === -1 || bet == 1) { 
                        //Start Slots
                        API.sendChat("/me [!slots] @" + chat.un + " ulaže 1 TOKEn na ChemSlots, i povlači ručicu ... i gleda kako se ChemSlots okrece.");
                        setTimeout(function() {API.sendChat("/me  Napokon se zaustavlja na: " + outcome[0] + outcome[1] + outcome[2])}, 5000);
                    } 
                    else if (bet > 1) { 
                        //Start Slots
                        API.sendChat("/me [!slots] @" + chat.un + " ulaže " + bet + " TOKEna na ChemSlots, i povlači ručicu... ... i gleda kako se ChemSlots okrece.");
                        setTimeout(function() {API.sendChat("/me Napokon se zaustavlja na: " + outcome[0] + outcome[1] + outcome[2])}, 5000);
                    } 
                    else {
                        return false; 
                    }
                         
                    //Display Outcome
                    if (outcome[3] == 0) {
                        if (updatedTokens === 1) {
                            setTimeout(function() {API.sendChat("/me @" + chat.un + ", nemaš sreće, luzeru! Nisi pobjedio. Imas 1 TOKEn. Čuo sam da je kockanje zarazno... želis pokušati ponovo?")}, 7000);   
                        }  
                        else if (updatedTokens === 0) {
                            setTimeout(function() {API.sendChat("/me @" + chat.un + ", nemaš sreće, luzeru! Nisi pobjedio. Nemas vise TOKena... gotov si, ya bum!")}, 7000);
                        }
                        else {
                            setTimeout(function() {API.sendChat("/me @" + chat.un + ", nemaš sreće, luzeru! Nisi dobio nista. Imas " + updatedTokens + " TOKEna. Čuo sam da je kockanje zarazno... želis pokušati ponovo?")}, 7000);
                        }
                    }
                    else if (outcome[3] == (bet * 7)) {
                        setTimeout(function() {
                        var id = chat.uid;
                        API.sendChat("/me @" + chat.un + ", Pogodio si Jackpot: " + outcome[3] + " TOKEna! Sada imaš " + updatedTokens + " Nemoj ih sve odjednom potrošit.");
                        bBot.userUtilities.moveUser(id, 1, false);}, 7000); 
                    }
                    else {
                        setTimeout(function() {
                 var id = chat.uid;
				 var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                 API.sendChat("/me @" + chat.un + ", Pobjedio si! Dobio si " + outcome[3] + " TOKEna! Sada imaš " + updatedTokens + " TOKEna. Možda da pokušaš ponovo?");
                 bBot.userUtilities.moveUser(id, pos, false);}, 7000);
                    }
                } 
            } 
        }, 
        
        // !tokens
        tokensCommand: { 
            command: 'tokens', 
            rank: 'user', 
            type: 'exact', 
            functionality: function (chat, cmd) {
                if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
		    var user = chat.un; 
		    var id = chat.uid;
		    if (botCreatorIDs.indexOf(user.id) > -1);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(bBot.chat.stokens);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = bBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(bBot.chat.nousertokens, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(bBot.chat.selftokens, {name: name}));
                            }
                            else {			
							var user = bBot.userUtilities.lookupUserName(name);
							var startingTokens = validateTokens(user);
				    var randomMax = 3;
				    var randomispis = Math.floor((Math.random() * randomMax) + 1)
							localStorage.setItem(user.username, randomispis);
                                return API.sendChat(subChat(bBot.chat.giventokens, {nameto: user.username, namefrom: chat.un}));
							}
							/*else {
                                API.sendChat(subChat(bBot.chat.superuser, {name: name}));
                            }*/
							
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(subChat(bBot.chat.rpslsempty));
                            return false;
                        }
                        else {
                            var choices = ["rock", "paper", "scissors", "lizard", "spock"];
                            var botChoice = choices[Math.floor(Math.random()*choices.length)];
                            var userChoice = msg.substring(space + 1);
                            if (botChoice == userChoice) {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslsdraw, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "rock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "rock" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "paper" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "scissors" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "scissors" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "scissors" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "scissors" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "lizard" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "lizard" && userChoice == "spock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "spock" && userChoice == "rock") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "spock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "spock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslslose, {name: chat.un}));
                                API.moderateForceSkip();
                            
                            } else if (botChoice == "spock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me je odabrao " + botChoice + ". " + bBot.chat.rpslswin, {name: chat.un}));
                            
                            } else {
                                return API.sendChat(bBot.chat.rpserror, {botchoice: botChoice, userchoice: userChoice});
                            }
                        }
                    }
                }
            },
            
            daveCommand: {
                command: 'dave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(bBot.chat.dave, {name: chat.un}));
                    }
                }
            },
            
             //SPECIAL COMMANDS
            eldoxCommand: {
command: 'eldox',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.eldox, {name: chat.un}));
}
}
},
stumblrCommand: {
command: 'stumblr',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
var link = "http://name-is-already-taken.tumblr.com/";
API.sendChat(subChat(bBot.chat.stumblr, {name: chat.un, link: link}));
}
}
}, 
askCommand: {
command: 'ask',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
var link = "http://ask.fm/BalkanParty12";
API.sendChat(subChat(bBot.chat.ask, {name: chat.un, link: link}));
}
}
},
tacaCommand: {
command: 'taca',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.taca, {name: chat.un}));
}
}
},
huligankaCommand: {
command: 'huliganka',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.huliganka, {name: chat.un}));
}
}
},
vlajkoCommand: {
command: 'vlajko',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.vlajko, {name: chat.un}));
}
}
},
masickaCommand: {
command: 'masicka',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.masicka, {name: chat.un}));
}
}
},
teaCommand: {
command: 'tea',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.tea, {name: chat.un}));
}
}
},
natalijaCommand: {
command: 'natalija',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.natalija, {name: chat.un}));
}
}
},
selmaCommand: {
command: 'selma',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.selma, {name: chat.un}));
}
}
},
roxorCommand: {
command: 'roxor',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.roxor, {name: chat.un}));
}
}
},
mujoCommand: {
command: 'mujo',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.mujo, {name: chat.un}));
}
}
},
filipCommand: {
command: ['filip', 'tjofi'],
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.filip, {name: chat.un}));
}
}
},
mamuzaCommand: {
command: 'mamuza',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.mamuza, {name: chat.un}));
}
}
},
cobraCommand: {
command: 'cobra',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.cobra, {name: chat.un}));
}
}
},
anjaCommand: {
command: 'anja',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.anja, {name: chat.un}));
}
}
},
smrtnikCommand: {
command: 'smrtnik',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.smrtnik, {name: chat.un}));
}
}
},
ahmedCommand: {
command: 'ahmed',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.ahmed, {name: chat.un}));
}
}
},
songunbanCommand: {
command: 'songunban',
rank: 'user',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.songunban, {name: chat.un}));
}
}
},
danceCommand: {
command: 'dance',
rank: 'mod',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.botwoot, {name: chat.un}));
$("#woot").click();
API.on(API.ADVANCE, autowoot);
function autowoot(){ $("#woot").click(); }
}
}
},
mehCommand: {
command: 'meh',
rank: 'mod',
type: 'exact',
functionality: function (chat, cmd) {
if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
if (!bBot.commands.executable(this.rank, chat)) return void (0);
else {
API.sendChat(subChat(bBot.chat.botmeh));
$("#meh").click();
API.on(API.ADVANCE, meh);
}
}
},

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof bBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(bBot.chat.youtube, {name: chat.un, link: "http://bit.ly/1JCermI"}));
                    }
                }
            },
            //SLOW
            slowCommand: {
                command: 'slow',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var slow;

                        if (msg.length === cmd.length)
                        {
                            slow = 30;
                        }
                        else {
                            slow = msg.substring(cmd.length + 1);
                            if (isNaN(slow))
                            {
                                return API.sendChat(subChat(bBot.chat.invalidtime, {name: chat.un}));
                            }
                        }
                        if(!bBot.room.slowMode)
                        {
                            bBot.room.slowMode = true;
                            bBot.room.slowModeDuration = slow;
                            API.sendChat("/me Spori način uključen, razmak između poruka: "+ slow + " sekundi!");
                        }else
                        {
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var sender = bBot.userUtilities.lookupUser(chat.uid);
                        var arguments = msg.split(' ');
                        var reciever = "";
                        var c = 0;
                        var rand = Math.random();
                        
                        arguments = arguments.filter(checkNull);
                        console.log(arguments);
                        if (arguments[0] == "!points" && arguments.length == 1)
                        {
                            $.ajaxSetup({async: false});
                            $.post("http://balkan19.gq/points/room/data-get.php",{winnerid:sender.id,dbPassword:bBot.settings.dbPassword}, function(data)
                            {
                                sender.balkanPoints = parseInt(data.trim());
                            });
                            if(!isNaN(sender.balkanPoints))
                            {
                                return API.sendChat("/me [!points] @" + chat.un + " imaš " + sender.balkanPoints + " BP Poena.");
                            }else
                            {
                                return API.sendChat("/me @" + chat.un + " imaš 0 BP Poena");
                            }                               
                            
                            
                        }
                        if(arguments.length > 3)
                        {
                            for(i = 3; i < arguments.length; i++)
                            {
                                if(reciever == "")
                                {
                                    reciever = reciever + arguments[i];
                                }
                                else
                                {
                                    reciever = reciever + " " + arguments[i];
                                }
                            }
                            console.log(reciever);
                            if(arguments[1] == "bet" && !isNaN(arguments[2]) && arguments[2] > 0)
                            {
                                var senderpoints;
                                var recieverpoints;
                                
                                reciever = reciever.trim();
                                if(reciever.startsWith("@"))
                                {
                                    reciever = reciever.trim().substring(1);
                                }
                                var recieverU = bBot.userUtilities.lookupUserName(reciever);
                                $.ajaxSetup({async: false});
                                $.post("http://balkan19.gq/points/room/data-get.php",{winnerid:sender.id,loserid:recieverU.id}, function(data)
                                {
                                    var points = data.trim().split(' ');
                                    sender.balkanPoints = parseInt(points[0]);
                                    recieverU.balkanPoints = parseInt(points[1]);
                                });
                                console.log(recieverU.inRoom);
                                if(recieverU == null || recieverU.inRoom && recieverU != sender)
                                {
                                    var offer = parseInt(arguments[2]);
                                    if(sender.isBetting)
                                    {
                                        return API.sendChat("/me @" + chat.un + " već si započeo okladu s nekim! Upiši !points \"stop\" da ju prekineš!");
                                    }
                                    if(recieverU.isBetting)
                                    {
                                        return API.sendChat("/me @" + chat.un + " " + recieverU.username + " se već kladi s nekim!");
                                    }
                                    if(isNaN(sender.balkanPoints) || (sender.balkanPoints < offer))
                                    {
                                        return API.sendChat("/me @" + chat.un + " nemaš dovoljno BP Poena za tu okladu!");
                                    }
                                    if(isNaN(recieverU.balkanPoints) || (recieverU.balkanPoints < offer))
                                    {
                                        return API.sendChat("/me @" + chat.un + " osoba s kojom se želiš kladiti nema dovoljno BP Poena za tu okladu! Ima samo: " + recieverU.balkanPoints);
                                    }
                                    
                                    recieverU.isBetting = true;
                                    recieverU.better = sender;
                                    recieverU.offered = offer;
                                    sender.isBetting = true;
                                    sender.toWho = recieverU;
                                    API.sendChat("/me @" + recieverU.username + " " + chat.un + " te poziva na opkladu! u " + offer + " BP Poena. Upišisi \"!points accept\" ili \"!points decline\"");
                                    return;
                                }else
                                {
                                    return API.sendChat("/me @" + chat.un + " osoba s kojom se želiš kladiti trenutno nije online! , ili si se pokušao kladiti sam s sobom!");
                                }
                            }else
                            {
                                return API.sendChat("/me @" + chat.un + " Unijeli ste neispravnu komandu. Upiši !points za viye informacija.");
                            }
                        }else if(arguments[1] == "accept")
                        {
                            if(!sender.isBetting)
                            {
                                return API.sendChat("/me @" + chat.un + " Nitko vas nije izazvao na okladu!");
                            }
                            if(sender.better.inRoom)
                            {
                                
                                if(rand >= 0.5)
                                {
                                    sender.balkanPoints += sender.offered;
                                    sender.better.balkanPoints -= sender.offered;
                                    
                                    $.ajaxSetup({async: false});
                                    $.post("http://balkan19.gq/points/room/data-edit.php",{winnerid:sender.id,winnername:sender.username,pointswon:sender.offered,loserid:sender.better.id,losername:sender.better.username,dbPassword:bBot.settings.dbPassword}, function(data){if(data.trim() != "PWD_OK"){API.sendChat("/me Problem sa upisivanjem podataka u bazu podataka!")};});
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " Oklada je završena! " + sender.username + " je pobjedio i osvojio " + sender.offered + " BP Poena");
                                }
                                else
                                {
                                    sender.balkanPoints -= sender.offered;
                                    sender.better.balkanPoints += sender.offered;
            
                                    $.ajaxSetup({async: false});
                                    $.post("http://balkan19.gq/points/room/data-edit.php",{winnerid:sender.better.id,winnername:sender.better.username,pointswon:sender.offered,loserid:sender.id,losername:sender.username,dbPassword:bBot.settings.dbPassword}, function(data){if(data.trim() != "PWD_OK"){API.sendChat("/me Problem sa upisivanjem podataka u bazu podataka!")};});
                                    var betusr = sender.better.username;
                                    finishBet(sender);
                                    return API.sendChat("/me @" + chat.un + " Oklada je završena! " + betusr + " je pobjedio i osvojio " + sender.offered + " BP Poena");
                                    
                                }
                                
                            }else
                            {
                                finishBet(sender);
                                return API.sendChat("/me @" + chat.un + " osoba koja te izazvala na okladu je trenutno offline, oklada se prekida!");
                            }
                        }else if(arguments[1] == "decline" )
                        {
                            if(!sender.isBetting)
                            {
                                return API.sendChat("/me @" + chat.un + " Nitko vas nije izazvao na okladu!");
                            }
                            finishBet(sender);
                            return API.sendChat("/me @" + chat.un + " oklada prekinuta!");
                        }else if(arguments[1] == "stop")
                        {
                            sender.isBetting = false;
                            sender.toWho.isBetting = false;
                            sender.toWho = null;
                            
                            return API.sendChat("/me @" + chat.un + " oklada prekinuta!");
                        }else if(arguments[1] == "leaderboard")
                        {
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
                            return API.sendChat("Pogledaj leaderboard na ovom linku: http://balkan-19.ga/leaderboard");
                        
                        }else if(arguments[1] == "help")
                        {
                            API.sendChat("/me @" + chat.un + " Da bi vidio koliko imaš BP Poena upiši !points, da bi se kladio s nekim upiši !points bet [bodovi] [ime], da bi prekinio poziv napiši !points stop, da prihvatis !points accept, da bi odbio napiši !points decline");
                            return API.sendChat("/me da vidiš leaderboard upiši !ap leaderboard");
                        }else
                        {
                            return API.sendChat("/me @" + chat.un + " Unijeli ste nepostojecu komandu. Upiši !points help za vise informacija.");
                        }
                        function checkNull(arg)
                        {
                            return arg !== null;
                        }
                        function finishBet(sender)
                        {
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
                    functionality: function (chat, cmd) {
                        if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                        if (!bBot.commands.executable(this.rank, chat)) return void (0);
                        else {
                            var arguments = chat.message.split(' ');
                            var amsg = getMessage(arguments);
                            if(arguments.length == 1 && arguments[0] == "!announce")
                            {
                                API.sendChat("/me @" + chat.un + " upiši !ap [nakon koliko minuta da se objavi poruka] [poruka] ili !announce stop da zaustaviš objavljivanje");
                            }else if(arguments[0] == "!announce" && !isNaN(arguments[1]) && arguments[2] != null )
                            {
                                if(!bBot.room.announceActive)
                                {
                                    announceActivate(arguments,amsg);
                                }else
                                {
                                    announceStop(arguments,amsg);
                                    announceActivate(arguments,amsg);
                                }
                                
                            }else if(arguments[0] == "!announce" && arguments[1] == "stop")
                            {
                                announceStop(arguments,amsg);
                            }else
                            {
                                API.sendChat("/me @" + chat.un + " neispravna komanda! upiši !ap [nakon koliko minuta da se objavi poruka] [poruka] ili !announce stop da zaustaviš objavljivanje");
                            }
                            function getMessage(arguments)
                            {
                                var stream = "";
                                for(i = 2; i < arguments.length; i++)
                                {
                                    stream += (' ' + arguments[i]);
                                }
                                return stream;
                            }
                            function announceStop(arguments,amsg)
                            {
                                if(!bBot.settings.announceActive)
                                {
                                API.sendChat("/me @" + chat.un + " objavljivanje je već ugašeno!");
                                return;
                                }else
                                {
                                bBot.settings.announceActive = false;
                                bBot.settings.announceMessage = null;
                                bBot.settings.announceStartTime = null;
                                bBot.settings.announceTime = null;
                                API.sendChat("/me @" + chat.un + " Uspešno ugašeno objavljivanje!");
                                return;
                                }
                            }
                            function announceActivate(arguments,amsg)
                            {
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.balkan-19.ga/leaderboard';
                        API.sendChat(subChat(bBot.chat.leaderboardlink, {name: chat.un, link: link}));
                    }
                }
            },
            
            updatePropsCommand: {
				command: 'updateprops',
				rank: 'menager', 
				type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
				command: 'quiz',  //The command to be called.
				rank: 'bouncer', //Minimum user permission to use the command
				type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!bBot.commands.executable(this.rank, chat)) return void (0);
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
						quizCycle = 4;
						quizLastUID = null;
						quizLastScore = 0;
						quizUsers = [];
						quizState = false;
						API.sendChat("/me @djs Kviz je poceo! Pravila su: Kviz je postavljen na " + maxPoints + " poena za pobjedu. Trenutni DJ ne moze da ucestvuje. Treba da se odgovori na 2 pitanja. Na drugi pitanje mozes da odgovoris samo ako si pogodio na prvo.");
					}
				}
			},
			
			weatherCommand: {
				command: 'weather',  //The command to be called. With the standard command literal this would be: !bacon
				rank: 'user', //Minimum user permission to use the command
				type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!bBot.commands.executable(this.rank, chat)) return void (0);
					else {
							var msg = chat.message;
							var lastSpace = msg.lastIndexOf(' ');
							var parameter = msg.substring(lastSpace + 1);
							
							simpleAJAXLib = {
							
									init: function () {
										this.fetchJSON("http://rss.accuweather.com/rss/liveweather_rss.asp?metric=2&locCode=" + parameter);
									},
							 
									fetchJSON: function (url) {
										var root = 'https://query.yahooapis.com/v1/public/yql?q=';
										var yql = 'select * from xml where url="' + url + '"';
										var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
										document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
									},
							 
									jsTag: function (url) {
										var script = document.createElement('script');
										script.setAttribute('type', 'text/javascript');
										script.setAttribute('src', url);
										return script;
									},
							 
									display: function (results) {								
										var temperature = results.query.results.rss.channel.item[0].description;
										temperature = temperature.replace('<img src="','').replace('">','');
										temperature = temperature.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
													var num = parseInt(numStr, 10); // read num as normal number
													return String.fromCharCode(num);
												});
										API.sendChat("/me " + temperature);
									}
							}
							simpleAJAXLib.init();
					}
				}
			},
			
			newsCommand: {
			command: 'news',  //The command to be called. With the standard command literal this would be: !bacon
			rank: 'user', //Minimum user permission to use the command
			type: 'startsWith', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
			functionality: function (chat, cmd) {
				if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
				if (!bBot.commands.executable(this.rank, chat)) return void (0);
				else {
						var msg = chat.message;
						var lastSpace = msg.lastIndexOf(' ');
						var parameter = msg.substring(lastSpace + 1);
						var selectedRSSFeed = -1;
						
						simpleAJAXLib = {
						
								init: function () {
									for (var i = 0; i < rssFeeds.length; i++) {
										//Match the parameter with the rssFeeds array. If non match, display the howto.
										if (parameter == rssFeeds[i][0]) {
											this.fetchJSON(rssFeeds[i][1]);
											selectedRSSFeed = i;
										} else if (selectedRSSFeed == -1 && rssFeeds.length - 1 == i) {
												var rssOptions = "/me Molim koristi kao jedne od sljedeci primjera (ie.'!news football'): '" + rssFeeds[0][0] + "'";
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
						 
								fetchJSON: function (url) {
									var root = 'https://query.yahooapis.com/v1/public/yql?q=';
									var yql = 'select * from xml where url="' + url + '"';
									var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
									document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
								},
						 
								jsTag: function (url) {
									var script = document.createElement('script');
									script.setAttribute('type', 'text/javascript');
									script.setAttribute('src', url);
									return script;
								},
						 
								display: function (results) {
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
											oneliner = oneliner.replace('<![CDATA[','').replace(']','').replace('<p>','').replace('</p>','').replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi,'');
											oneliner = oneliner.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
												var num = parseInt(numStr, 10); // read num as normal number
												return String.fromCharCode(num);
											});
											oneliner = oneliner.replace('/ +/','');
											if (oneliner.length > 249) {
												var counter=0;
												for (var x=0; x < oneliner.length; x++) {
												  setTimeout(function() {API.sendChat("/me " + oneliner.substring(counter*249,(counter+1)*249));counter++;},x*2000);
												}
											} else {
												API.sendChat(						
													oneliner
												);
											}
										} else if(rssFeeds[selectedRSSFeed][0] === "isles") {
											var islesDescr = results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].description;
											var islesPart1 = islesDescr.substr(0,200);
											
											API.sendChat(
											"/me "
											+ results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].pubDate 
											+ " // "
											+ islesPart1
											+ "..."
											);
											
										} else {
											API.sendChat(
											"/me "
											+ results.query.results.rss.channel.item[rssFeeds[selectedRSSFeed][3]].title 
											+ " (" 
											+ long_url
											+ ")");
										}
									}
								}
						}
						simpleAJAXLib.init();
					}
				}
			},
			
			artistinfoCommand: {
				command: 'artistinfo',  //The command to be called.
				rank: 'user', //Minimum user permission to use the command
				type: 'exact', //Specify if it can accept variables or not (if so, these have to be handled yourself through the chat.message
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {

					simpleAJAXLib = {
						
								init: function () {
									var artist = API.getMedia().author;
									var url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=b3cb78999a38750fc3d76c51ba2bf6bb&artist=' + artist.replace(/&/g,"%26").replace(/ /g,"%20") + '&autocorrect=1'
									this.fetchJSON(url);
								},
						 
								fetchJSON: function (url) {
									var root = 'https://query.yahooapis.com/v1/public/yql?q=';
									var yql = 'select * from xml where url="' + url + '"';
									var proxy_url = root + encodeURIComponent(yql) + '&format=json&diagnostics=false&callback=simpleAJAXLib.display';
									document.getElementsByTagName('body')[0].appendChild(this.jsTag(proxy_url));
								},
						 
								jsTag: function (url) {
									var script = document.createElement('script');
									script.setAttribute('type', 'text/javascript');
									script.setAttribute('src', url);
									return script;
								},
						 
								display: function (results) {
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
									},100);
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
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var limit;

                        if (msg.length === cmd.length)
                        {
                            limit = 5;
                        }
                        else {
                            limit = msg.substring(cmd.length + 1);
                            if (isNaN(limit))
                            {
                                return API.sendChat("/me @" + chat.un + "Neispravna komanda, upiši !mehautoban [limit], gdje je limit maksimalan broj mehova zaredom");
                            }
                        }
                        if(!bBot.settings.mehAutoBan)
                        {
                            bBot.settings.mehAutoBan = true;
                            bBot.settings.mehAutoBanLimit = limit;
                            API.sendChat("/me Auto banovanje za uzastopno mehovanje uključeno! Limit uzastopnih mehova: "+ limit);
                        }else
                        {
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
