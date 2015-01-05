Items = new Meteor.Collection("items");
Regals = new Meteor.Collection("regals");
var defaultRegal = "Gdzieś na podłodze...";

if (Meteor.isClient) {
  var esc = Session.get('escapeRegExp');
  var selectedDiv = null;
  Session.set('selected', null);
  Session.set('query', "");
  Session.set('sortOrder', {author: 1, title: 1, regal:1, shelf:1})
    
  Template.list.helpers({
    items: function() {
      var q = Session.get('query');
      q = Meteor.myObjects.escapeRegExp(q);
      var so = Session.get('sortOrder');
      if( q.length > 0 ){
        return Items.find(
          { $or: [ 
            { title: { $regex: q, $options: 'i' }},
            { author: { $regex: q, $options: 'i' }},
            { regal: { $regex: q, $options: 'i' }},
            { shelf: { $regex: q, $options: 'i' }}
          ]}, { sort: so }
        );
      }
      else{
        return Items.find({}, { sort: so });
      }
    }
  });
  
  Template.registerHelper("regals", function(){
      return Regals.find({});
    });
  
  Template.controls.events({
    'submit #add-book': function(event) {
      event.preventDefault();
      
      var titleObj = $(event.target).find('[id=newTitle]');
      var authorObj = $(event.target).find('[id=newAuthor]');
      var title = titleObj.val();
      var author = authorObj.val();
      titleObj.val("");
      authorObj.val("");
      titleObj.focus();
      Items.insert({title:title, author:author});
    },
    'submit #add-regal': function(event) {
      event.preventDefault();
      
      var regal = $(event.target).find('[id=newRegal]').val();
      $(event.target).find('[id=newRegal]').val("");
      if(Regals.find({name:regal}).count()===0){
        Regals.insert({name:regal, shelves: ['']});
      }
    },
    'submit #add-shelf': function(event){
      event.preventDefault();
      
      var regal = $(event.target).find('select').val();
      var shelf = $(event.target).find('[id=newShelf]').val();
      $(event.target).find('[id=newShelf]').val('');
      
      var id = Regals.find({name:regal}).fetch()[0]._id;
      Regals.update({_id:id}, {$push:{shelves:{name:shelf}}});
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
      Session.set('sortOrder', {title:1, author:1, regal:1, shelf:1});
    },
    'click #authorCaption': function(){
      Session.set('sortOrder', {author:1, title:1, regal:1, shelf:1});
    },
    'click #regalCaption': function(){
      Session.set('sortOrder', {regal:1, shelf:1, title:1, author:1});
    },
    'click #books .book-field': function() {
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
    },
    shelves: function(){
      var regalName = $("#details_regal").val();
      var regal = Regals.find({name:regalName}).fetch()[0];
      console.log(regalName);
      if(!regal) {
        regal = {shelves: [{name:''}]};
      }
      return regal.shelves;
    }
  });
  
  function updateDetails(target){
    if(Session.get('selected'))
    {
      var titleObj = target.find('[id=details_title]');
      var title = titleObj.val();
      var authorObj = target.find('[id=details_author]');
      var author = authorObj.val();
      var regalObj = target.find('[id=details_regal]');
      var regal = regalObj.val();
      if(regal === defaultRegal){
        regal = {name:""};
      }
      var shelfObj = target.find('[id=details_shelf]');
      var shelf = shelfObj.val();
      Items.update({_id:Session.get('selected')._id}, {$set:{author:author}});
      Items.update({_id:Session.get('selected')._id}, {$set:{title:title}});
      Items.update({_id:Session.get('selected')._id}, {$set:{regal:regal}});
      Items.update({_id:Session.get('selected')._id}, {$set:{shelf:shelf}});
    }
  }
  
  Template.details.events({
    'dblclick #del': function(){
      if(Session.get('selected')){
        Items.remove({_id:Session.get('selected')._id});
        Session.set('selected', null);
      }
    },
    'submit form': function(){
      event.preventDefault();
      updateDetails($(event.target));
    },
    'change select': function(){
      updateDetails($(event.target).parent().parent());
    }
  });
}
 
if (Meteor.isServer) {
  Meteor.startup(function () {
//     Regals.remove({});
    if(Regals.find({default: true}).count() === 0){
      Regals.insert({default: true, name:defaultRegal, shelves: []});
    }
  });
}
