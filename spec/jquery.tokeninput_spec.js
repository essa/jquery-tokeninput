
describe("jquery.tokeninput", function() {
  describe("test the environment", function() {
    it("shoud success", function() {
      expect(1+1).toEqual(2);
    });
  });

  beforeEach(function() {
    $('.token-input-dropdown').remove();  // clear the element added by jquery.tokeninput in previous test
  });
  
  describe("basic usage", function() {
    // To use it, make an <input> and call tokenInput() for it
    beforeEach(function() {
      setFixtures("<div id='test-token-input'><input id='target' type='text' /></div> ");
      $("#target").tokenInput("/tags");
    });
    
    it("should setup the token input list", function() {
      // console.log($('#test-token-input').html());
      expect($('#test-token-input')).toContain("ul.token-input-list");
      expect($('#test-token-input')).toContain("ul.token-input-list li.token-input-input-token");
    });
    
    it("should setup a new <input> element in the li", function() {
      expect($('#test-token-input')).toContain("ul.token-input-list li.token-input-input-token input");
    });
    
    it("should hide the original input", function() {
      expect($('#target')).toBeHidden();
    });

    describe("on typing partial token", function() {
      
      beforeEach(function() {
        this.ajax = sinon.stub($, "ajax");
        var input = $("ul.token-input-list li.token-input-input-token input");
        input.val('abc');
        var e = $.Event('keydown');
        e.keyCode = 65; // 'A'
        input.trigger(e);
      });
      
      afterEach(function(){
        this.ajax.restore();
      });
      
      it("should call $.ajax", function() {
        waits(500); // waits for setting.searchDelay
        runs(function() {
          expect(this.ajax.called).toBeTruthy();
        });
      });

      it("should call $.ajax for the url", function() {
        waits(500); // waits for setting.searchDelay
        runs(function() {
          var args = this.ajax.getCall(0).args[0];
          expect(args.data).toEqual({q: 'abc'});
          expect(args.url).toEqual('/tags');
        });
      });

    });
    
    describe("on seach success", function() {
      
      beforeEach(function() {
        this.server = sinon.fakeServer.create();
        var data = '[{ "id":123, "name": "abcdef" }]'; // search result from server
        this.server.respondWith(
          "GET",
          "/tags?q=abc",
          [200, { "Content-Type": "application/json" }, data]
        );
        
        var input = $("ul.token-input-list li.token-input-input-token input");
        input.val('abc');
        var e = $.Event('keydown');
        e.keyCode = 65; // 'A'
        input.trigger(e);
      });

      afterEach(function() {
        this.server.restore();
      });
      
      it("should render dropdown", function() {
        waits(500); 
        runs(function() {
          this.server.respond();
          console.log($('.token-input-dropdown').html());
          expect($('.token-input-dropdown')).toHaveText("abcdef");
        });
      });
    });
    
    describe("on selecting a dropdown item", function() {

      beforeEach(function() {
        this.server = sinon.fakeServer.create();
        var data = '[{ "id":123, "name": "abcdef" }]';
        this.server.respondWith("GET", "/tags?q=abc",
                               [200, { "Content-Type": "application/json" },
                                data]);
        
        var input = $("ul.token-input-list li.token-input-input-token input");
        input.val('abc');
        var e = $.Event('keydown');
        e.keyCode = 65; // 'A'
        input.trigger(e);
        waits(500); 
        runs(function() {
          this.server.respond();
          expect($('.token-input-dropdown')).toHaveText("abcdef");
        });
      });
      
      afterEach(function() {
        this.server.restore();
      });
      
      it("should update original input", function() {
        waits(500); 
        runs(function() {
          var input = $("ul.token-input-list li.token-input-input-token input");
          var e = $.Event('keydown');
          this.server.respond();
          e.keyCode = 13; // KEY.ENTER
          input.trigger(e);
          expect($('#target').val()).toEqual("123"); // should be the id of selected token
        });
      });
    });
  });
});

