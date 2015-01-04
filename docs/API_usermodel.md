# Temporary API Todo List

## Core
* usermodel.core.init = function(callback)
* usermodel.core.connectDB = function(callback)
* usermodel.core.expose_json = function(api_function)
## Auth
* usermodel.auth.checkPassword = function(user, password, callback){} # message:username

## Users
* usermodel.users.getUserNames = function(callback) #message:usernames

* usermodel.users.getUser = function(user, callback){} #message:user
* usermodel.users.getUsers = function(callback){} #message:allUsers

* usermodel.users.hasUser = function(user, callback){} #message:hasUser

* usermodel.users.createUser = function(user, callback){} #message: user
* usermodel.users.setUser = function(user, data, callback){} #message: user
* usermodel.users.deleteUser = function(user, callback){}

* usermodel.users.reset = function(callback){}

* usermodel.users.getUserProperty = function(user, property, defaultValue, callback){} # message:value
* usermodel.users.setUserProperty = function(user, property, value, callback){}

* usermodel.users.getIsAdmin = function(user, callback) #message: isAdmin
* usermodel.users.setIsAdmin = function(user, isAdmin, callback){}

* usermodel.users.getAllowedEmails = function(user, callback){} #message: allowedEmails
* usermodel.users.setAllowedEmails = function(user, allowedEmails, callback){}

* usermodel.users.getDrafts = function(user, callback){} #message: drafts
* usermodel.users.setDrafts = function(user, drafts, callback){}

## Drafts

* usermodel.drafts.getDraftIds = function(user, callback){} #message: draftIds
* usermodel.drafts.getDraft = function(user, id, callback){} #message: draft
* usermodel.drafts.getDrafts = function(user, callback){} #message: drafts
* usermodel.drafts.setDraft = function(user, id, draft, callback){}
* usermodel.drafts.hasDraft = function(user, id, callback){} #message: hasDraft
* usermodel.drafts.deleteDraft = function(user, id, callback){}
* usermodel.drafts.createNewDraftId = function(user, callback){} #message: newId

## Sessions
* usermodel.session.hasSession = function(req, res, callback){} #message: hasSession
* usermodel.session.login = function(req, res, callback){}
* usermodel.session.endSession = function(req, res, callback){}

* usermodel.session.needUser = function(req, res, next){}
* usermodel.session.needAdmin = function(req, res, next){}
