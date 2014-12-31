Items = new Meteor.Collection("items");
if (Meteor.isClient) {
  var esc = Session.get('escapeRegExp');
  var selectedDiv = null;
  Session.set('selected', null);
  Session.set('query', "");
  Session.set('sortOrder', {author: 1, title: 1})
    
  Template.list.helpers({
    items: function() {
      var q = Session.get('query');
      q = Meteor.myObjects.escapeRegExp(q);
      var so = Session.get('sortOrder');
      if( q.length > 0 ){
        return Items.find(
          { $or: [ 
            { title: { $regex: q, $options: 'i' }},
            { author: { $regex: q, $options: 'i' }}
          ]}, { sort: so }
        );
      }
      else{
        return Items.find({}, { sort: so });
      }
    }
  });
  
  Template.controls.events({
    'submit form': function(event) {
      event.preventDefault();
      
      var titleObj = $(event.target).find('[id=newTitle]');
      var authorObj = $(event.target).find('[id=newAuthor]');
      var title = titleObj.val();
      var author = authorObj.val();
      titleObj.val("");
      authorObj.val("");
      titleObj.focus();
      Items.insert({title:title, author:author});
    }
  });
  
  Template.szukajka.events({
    'submit form': function(event){
      event.preventDefault();
      
      var q = $(event.target).find('[id=searchQuery]').val();
      Session.set('query', q);
    },
    'keyup': function(event){      
      var q = $(event.target).val();
      Session.set('query', q);
    }
  })
  
  Template.list.events({
    'click #titleCaption': function(){
      Session.set('sortOrder', {title:1, author:1});
    },
    'click #authorCaption': function(){
      Session.set('sortOrder', {author:1, title:1});
    },
    'click .book-field': function() {
      function select(duration, tar){
        Session.set('selected', this);
        selectedDiv.addClass("selected");
        $("#book-details").slideDown(duration);
      }
      function deselect(duration){
        $("#book-details").slideUp(duration, function(){
          Session.set('selected', null);
          selectedDiv.removeClass("selected");
          selectedDiv = null;
        });
      }
      var sel = Session.get('selected');
      if(sel){
        if( sel._id !== this._id){
          $("#book-details").slideUp(175, select.bind(this, 225));
          selectedDiv.removeClass("selected");
          selectedDiv = $(event.target).parent();
        }
        else{
          deselect.call(this,200);
        }
      }
      else{
        selectedDiv = $(event.target).parent();
        select.call(this, 300);
      }
    }
  });
  
  Template.details.helpers({
    victim: function(){ 
      var defaultBook = {author: "", title: ""};
      return Session.get('selected') || defaultBook; 
    }
  });
  
  Template.details.events({
    'dblclick #del': function(){
      if(Session.get('selected')){
        Items.remove({_id:Session.get('selected')._id});
        Session.set('selected', null);
      }
    },
    'submit form': function(){
      event.preventDefault();
      if(Session.get('selected')){
        var titleObj = $(event.target).find('[id=details_title]');
        var title = titleObj.val();
        var authorObj = $(event.target).find('[id=details_author]');
        var author = authorObj.val();
        Items.update({_id:Session.get('selected')._id}, {$set:{author:author}});
        Items.update({_id:Session.get('selected')._id}, {$set:{title:title}});
      }
    }
  });
}
 
if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
