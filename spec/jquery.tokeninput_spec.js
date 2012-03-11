//     describe("", function() {});
//     it("", function() {});
//     before(function() {});

describe("jquery.tokeninput", function() {
  describe("test the environment", function() {
    it("shoud success", function() {
      expect(1+1).toEqual(2);
    });
  });
  describe("basic usage", function() {
    beforeEach(function() {
      setFixtures("<div id='test-token-input'><input id='target' type='text' /></div> ");
      $("#target").tokenInput("/tags");
    });
    
    it("should setup the token input list", function() {
      console.log($('#test-token-input').html());
      expect($('#test-token-input')).toContain("ul.token-input-list");
      expect($('#test-token-input')).toContain("ul.token-input-list li.token-input-input-token");
    });
    it("should setup a input", function() {
      expect($('#test-token-input')).toContain("ul.token-input-list li.token-input-input-token input");
    });
    it("should hide the original input", function() {
      expect($('#target')).toBeHidden();
    });

    describe("on keyboard input", function() {
      
      beforeEach(function() {
        $.ajax = sinon.stub();
        var input = $("ul.token-input-list li.token-input-input-token input");
        input.val('abc');
        e = $.Event('keydown');
        e.keyCode = 65; // 'A'
        input.trigger(e);
      });
      
      it("should call $.ajax", function() {
        waits(500); // waits for setting.searchDelay
        runs(function() {
          expect($.ajax.called).toBeTruthy();
        });
      });

      it("should call $.ajax for the url", function() {
        waits(500); // waits for setting.searchDelay
        runs(function() {
          var args = $.ajax.getCall(0).args[0];
          expect(args.data).toEqual({q: 'abc'});
          expect(args.url).toEqual('/tags');
        });
      });

    });
    
    describe("on seach success", function() {
      var input = null;
      
      beforeEach(function() {
        this.server = sinon.fakeServer.create();
        data = '[{ "id":123, "name": "abcdef" }]';
        this.server.respondWith("GET", "/tags?q=abc",
                               [200, { "Content-Type": "application/json" },
                                data]);
        
        input = $("ul.token-input-list li.token-input-input-token input");
        input.val('abc');
        e = $.Event('keydown');
        e.keyCode = 65; // 'A'
        input.trigger(e);
      });

      afterEach(function() {
        this.server.restore();
      });
      
      it("should render dropdown", function() {
        waits(500); // waits for setting.searchDelay
        runs(function() {
          this.server.respond();
        });
        waits(500);
        runs(function() {
          expect($('.token-input-dropdown')).toHaveText("abcdef");
        });
      });

    });
  });
});