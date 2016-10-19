$(document).ready(function() {

  var $reset = $("#reset");
  var $start = $("#start");
  var $space = $(".space");
  var $board = $(".board");

  var gameStatus = 0;
  var activePlayer = "x";
  var player1 = {
    "name": "Player 1",
    "wins": 0,
    "type": "human",
    "playAs": "x",
    "ailevel": 0,
  };
  var player2 = {
    "name": "Player 2",
    "wins": 0,
    "type": "human",
    "playAs": "o",
    "ailevel": 0,
  };

  var victoryConditions = [
    ["A1", "A2", "A3"],
    ["A1", "B2", "C3"],
    ["A1", "B1", "C1"],
    ["B1", "B2", "B3"],
    ["C1", "B2", "A3"],
    ["C1", "C2", "C3"],
    ["A2", "B2", "C2"],
    ["A3", "B3", "C3"],
  ];

  var winningArray = [];

  var moves = {
    "x": [],
    "o": [],
    "available": ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
    "markspace": {
      "x": function(spaceid) {
        $(spaceid).html("<span class='markX'>&#215;</span>");
      },
      "o": function(spaceid) {
        $(spaceid).html("<span class='markO'>O</span>");
      }
    }
  };
var counttest = [];
  var AIobj = {
    "scoredmoves": [],
    "scoremove": function(move, moveindex, aimoves, opponentmoves, availablemoves, turn, count) {
      var newaimoves = aimoves.slice();
      var newopponentmoves = opponentmoves.slice();
      if (turn === "ai"){
        newaimoves.push(move);
      } else {
        newopponentmoves.push(move);
      }
      var remainingavailablemoves = availablemoves.slice();
      remainingavailablemoves.splice(moveindex, 1);
      
      if (checkVictory(newaimoves)) {
        return 10 - count;        
      } else if (checkVictory(newopponentmoves)) {
          return -10 + count;
      } else if (remainingavailablemoves.length === 0) {
        return count;
      } else {
        var nextturn;
        var newcount = Number(count);
        var movescore = 0;
        if (turn === "ai"){
          nextturn = "opponent";
          newcount++;
        }
        else if (turn === "opponent"){
          nextturn = "ai";
        }

        var nextlevel = remainingavailablemoves.map(function(nextmove, nextindex) {
          var nextmovescore = [AIobj.scoremove(nextmove, nextindex, newaimoves, newopponentmoves,remainingavailablemoves,nextturn,newcount), nextmove];
          return nextmovescore;
          });
        
          if (nextturn === "ai"){
            sortbest(nextlevel);
            movescore = nextlevel[0][0];
            }
           else {
            sortworst(nextlevel);
            movescore = nextlevel[0][0];
            }
          
        return movescore;
      }
    },

    "scoreavailablemoves": function() {
      AIobj.scoredmoves = [];
      if (activePlayer == "x") {
        AIobj.scoredmoves = moves.available.map(function(move, index) {
          var scoredmove = [AIobj.scoremove(move,index, moves.x, moves.o, moves.available, "ai", 0), move];
          return scoredmove;
        });
      } else {
        AIobj.scoredmoves = moves.available.map(function(move, index) {
          var scoredmove = [AIobj.scoremove(move, index, moves.o, moves.x, moves.available, "ai", 0), move];
          return scoredmove;
        });
      }
    },

    "takerandommove": function() {
      if (gameStatus === 1) {
        var randomspace = moves.available[Math.floor(Math.random() * moves.available.length)];
        DoMove(randomspace);
      }
    },

    "takeperfectmove": function() {
      AIobj.scoreavailablemoves();
      sortbest(AIobj.scoredmoves);
      //console.log(AIobj.scoredmoves);
      DoMove(AIobj.scoredmoves[0][1]);
    },

    "takeAImove": function(aiplayer) {
      if (gameStatus === 1) {
        this.scoredmoves = [];
        if (aiplayer.ailevel === 0) {
          AIobj.takerandommove();
        } else if (aiplayer.ailevel == 1) {
          if (Math.random() < 0.3) {
            AIobj.takerandommove();
          } else {
            AIobj.takeperfectmove();
          }
        } else if (aiplayer.ailevel == 2) {
          AIobj.takeperfectmove();
        }
      }
    }
  };

  function sortbest(moves) {
    var sorted = moves.sort(function(a, b) {
      return b[0] - a[0];
    });
    return sorted;
  }
  
  function sortworst(moves) {
    var sorted = moves.sort(function(a, b) {
      return a[0] - b[0];
    });
    return sorted;
  }

  function doAImove() {
    if (gameStatus == 1) {
      if (player1.type == "ai" && player1.playAs == activePlayer) {
        AIobj.takeAImove(player1);
      } else if (player2.type == "ai" && player2.playAs == activePlayer) {
        AIobj.takeAImove(player2);
      }
    }
  }

  function generalReset() {
    $space.empty();
    $space.removeClass("tieboard");
    $space.removeClass("highlightVictory");
    $space.addClass("gamespace");
    winningArray = [];
    moves.x = [];
    moves.o = [];
    moves.available = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];
    activePlayer = "x";
    $(".player1").removeClass("activeplayer");
    $(".player2").removeClass("activeplayer");
    updateScore();
  }

  function fullReset() {
    $(".playername").prop('disabled', false);
    $("#player1ailevel").removeClass("easyai averageai expertai");
    $("#player2ailevel").removeClass("easyai averageai expertai");
    generalReset();
    gameStatus = 0;
    $start.html("Start");
    $start.removeClass("startactive");
    generalReset();
    $board.hide("blind", 500);
    $(".playername").val("");
    player1.wins = 0;
    player2.wins = 0;
    player1.name = "Player 1";
    player2.name = "Player 2";
    player1.playAs = "x";
    player2.playAs = "o";
    player1.type = "human";
    player2.type = "human";
    $("#player1type").html(player1.type);
    $("#player2type").html(player2.type);
    $("#player1playAs").html(player1.playAs);
    $("#player2playAs").html(player2.playAs);
    $("#player1ailevel").empty();
    $("#player1ailevel").hide();
    $("#player2ailevel").empty();
    $("#player2ailevel").hide();
    updateScore();
  }

  function SetNames() {
    $(".playername").prop('disabled', true);
    if ($("#player1name").val().length > 0) {
      player1.name = $("#player1name").val();
    } else {
      player1.name = "Player 1";
    }
    if ($("#player2name").val().length > 0) {
      player2.name = $("#player2name").val();
    } else {
      player2.name = "Player 2";
    }
  }

  function StartGame() {
    SetNames();
    generalReset();
    gameStatus = 1;
    $start.html("Start Over?");
    $start.addClass("startactive");
    $board.show("blind", 500);
    if (player1.playAs == "x"){
      $(".player1").addClass("activeplayer");
    }
    else {
      $(".player2").addClass("activeplayer");
    }
    updateScore();
    doAImove();
  }

  function togglePlayer() {
    if (gameStatus === 1) {
      if (activePlayer == "x") {
        activePlayer = "o";
      } else {
        activePlayer = "x";
      }
      $(".player1").toggleClass("activeplayer");
      $(".player2").toggleClass("activeplayer");
      doAImove();
    }
  }

  function AddWin(winner) {
    if (player1.playAs == winner) {
      player1.wins++;
    } else player2.wins++;
  }

  function updateScore() {
    var score1 = player1.name + ": " + player1.wins;
    var score2 = player2.name + ": " + player2.wins;
    $(".player1").html(score1);
    $(".player2").html(score2);
  }

  function highlightTie() {
    $(".space").removeClass("gamespace");
    $(".player1").removeClass("activeplayer");
    $(".player2").removeClass("activeplayer");
    $start.html("Tie. Again?");
    $space.addClass("tieboard");
    gameStatus = 0;
  }

  function highlightVictory(condition) {
    $(".space").removeClass("gamespace");
    var target1 = "#" + condition[0];
    var target2 = "#" + condition[1];
    var target3 = "#" + condition[2];
    $(target1).addClass("highlightVictory");
    $(target2).addClass("highlightVictory");
    $(target3).addClass("highlightVictory");
    $start.html("Play Again?");
    updateScore();
  }

  function checkVictory(movelist) {
    for (var i = 0; i < victoryConditions.length; i++) {
      if (movelist.includes(victoryConditions[i][0]) && movelist.includes(victoryConditions[i][1]) && movelist.includes(victoryConditions[i][2])) {
        winningArray = victoryConditions[i];
        return true;
      }
    }
  }

  function DoMove(space) {
    var spaceID = '#' + space;
    if (gameStatus === 1 && moves.available.includes(space)) {
      moves.markspace[activePlayer](spaceID);
      moves[activePlayer].push(space);
      moves.available.splice(moves.available.indexOf(space), 1);
      if (checkVictory(moves[activePlayer])) {
        gameStatus = 0;
        AddWin(activePlayer);
        highlightVictory(winningArray);
      }
      if (gameStatus === 1 && moves.available.length === 0) {
        highlightTie();
      } else togglePlayer();
    }
  }

  $space.click(function() {
    var space = this.id;
    DoMove(space);
  });

  $(".typebutton").click(function() {
    if (gameStatus === 0) {
      if (this.id == "player1type") {
        if (player1.type == "human") {
          $("#player1ailevel").removeClass("easyai averageai expertai");
          player1.type = "ai";
          player1.ailevel = 2;
          $("#player1ailevel").html("expert");
          $("#player1ailevel").show();
          $("#player1ailevel").addClass("expertai");
        } else {
          player1.type = "human";
          $("#player1ailevel").removeClass("easyai averageai expertai");
          $("#player1ailevel").empty();
          $("#player1ailevel").hide();
        }
        $("#" + this.id).html(player1.type);
      } else {
        if (player2.type == "human") {
          $("#player2ailevel").removeClass("easyai averageai expertai");
          player2.type = "ai";
          player2.ailevel = 2;
          $("#player2ailevel").html("expert");
          $("#player2ailevel").show();
          $("#player2ailevel").addClass("expertai");
        } else {
          player2.type = "human";
          $("#player2ailevel").removeClass("easyai averageai expertai");
          $("#player2ailevel").empty();
          $("#player2ailevel").hide();
        }
        $("#" + this.id).html(player2.type);
      }
    }
  });

  $(".xobutton").click(function() {
    if (gameStatus === 0) {
      if (player1.playAs == "x") {
        player1.playAs = "o";
        player2.playAs = "x";
      } else {
        player1.playAs = "x";
        player2.playAs = "o";
      }
      $("#player1playAs").html(player1.playAs);
      $("#player2playAs").html(player2.playAs);

    }
  });

  $(".ailevel").click(function() {
    if (gameStatus === 0) {
      if (this.id == "player1ailevel") {
        if (player1.ailevel === 0) {
          player1.ailevel = 1;
          $("#player1ailevel").html("average");
          $("#player1ailevel").toggleClass("easyai");
          $("#player1ailevel").toggleClass("averageai");
        } else if (player1.ailevel === 1) {
          player1.ailevel = 2;
          $("#player1ailevel").html("expert");
          $("#player1ailevel").toggleClass("averageai");
          $("#player1ailevel").toggleClass("expertai");
        } else {
          player1.ailevel = 0;
          $("#player1ailevel").html("easy");
          $("#player1ailevel").toggleClass("expertai");
          $("#player1ailevel").toggleClass("easyai");
        }
      } else {
        if (player2.ailevel === 0) {
          player2.ailevel = 1;
          $("#player2ailevel").html("average");
          $("#player2ailevel").toggleClass("easyai");
          $("#player2ailevel").toggleClass("averageai");
        } else if (player2.ailevel === 1) {
          player2.ailevel = 2;
          $("#player2ailevel").html("expert");
          $("#player2ailevel").toggleClass("averageai");
          $("#player2ailevel").toggleClass("expertai");
        } else {
          player2.ailevel = 0;
          $("#player2ailevel").html("easy");
          $("#player2ailevel").toggleClass("expertai");
          $("#player2ailevel").toggleClass("easyai");
        }
      }
    }
  })

  $start.click(function() {
    StartGame();
  });

  $reset.click(function() {
    fullReset();
  });

});