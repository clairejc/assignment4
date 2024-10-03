import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Posting, Sessioning, Profiling, EventHosting } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  //session
  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  //users 
  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string, name: string, phone: number, birthday: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password, name, phone, birthday);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }


  //profiles:

  @Router.patch("/profiles/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Profiling.updateUsername(user, username);
  }

  @Router.patch("/profiles/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Profiling.updatePassword(user, currentPassword, newPassword);
  }

  @Router.patch("/profiles/location")
  async updateLocation(session: SessionDoc, newLocation: string) {
    const user = Sessioning.getUser(session);
    return Profiling.updateLocation(user, newLocation);
  }

  @Router.patch("/profiles/language")
  async updateLanguage(session: SessionDoc, newLanguage: string) {
    const user = Sessioning.getUser(session);
    return Profiling.updateLanguage(user, newLanguage);
  }

  @Router.delete("/profiles")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Profiling.delete(user);
  }


  //eventhosts:

  @Router.post("/eventhosts")
  async createEvent(session: SessionDoc, title: string, description: string, date: number, spots: number) {
    const user = Sessioning.getUser(session);
    const created = await EventHosting.create(user, title, description, date, spots);
    return { msg: created.msg, post: await Responses.event(created.event) };
  }

  @Router.delete("/eventhosts/:id")
  //can only delete event if user is organizer of event
  async deleteEvent(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await EventHosting.assertOrganizerIsUser(oid, user);
    return EventHosting.delete(oid);
  }

  @Router.patch("/eventhosts/:id")
  async updateEvent(session: SessionDoc, id: string, description: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await EventHosting.assertOrganizerIsUser(oid, user);
    return EventHosting.update(oid, description);
  }

  @Router.get("/eventhosts")
  async getEvents(session: SessionDoc, organizer: string ) {
    if (!organizer) {
      return {msg: "Displaying all events", events: await EventHosting.getAllEvents()};
    }
    const userid = await Authing.getIdByUser(organizer);
    const events = await EventHosting.getByOrganizer(userid);
    return Responses.events(events);
  }


  //eventviews

  @Router.patch("/eventview/signups")
  async eventSignup(session: SessionDoc, event: ObjectId) {

  }

  @Router.patch("/eventview/waitlists")
  async eventWaitlist(session: SessionDoc, event: ObjectId) {

  }

  @Router.delete("/eventview/signups")
  async removeSignup(session: SessionDoc, event: ObjectId) {

  }

  @Router.delete("/eventview/waitlist")
  async removeWaitlist(session: SessionDoc, event: ObjectId) {

  }

  @Router.patch("/eventview/filters")
  async addFilter(session: SessionDoc, filter:string) {

  }

  @Router.delete("/eventview/filters/remove")
  async removeFilter(session: SessionDoc, organizer: string, filter: string) {

  }

  @Router.delete("/eventview/filters/reset")
  async resetFilters(session: SessionDoc, user: ObjectId){

  }

  @Router.patch("/eventview/filters")
  async sortbyNewest(session: SessionDoc, user: ObjectId) {

  }

  //instruction's actions are static and can be included on the page
  
  // friendshiphub
  @Router.post("/friendshiphub/profile")
  async createFriendshipProfile(session: SessionDoc, birthday: number, location: string, genderPronouns: string) {
  }

  @Router.patch("/users/profile")
  async editFriendshipProfile(session: SessionDoc, birthday: number, location: string, genderPronouns: string) {
  }

  @Router.patch("/users/profile/like")
  async sendLike(session: SessionDoc, toUser: ObjectId) {

  }

  @Router.patch("/users/profile/message")
  async sendFriendshipMessage(session: SessionDoc, toUser: ObjectId, message: String) {
    
  }

  @Router.patch("/users/profile/request")
  async acceptRequest(session: SessionDoc, toUser: ObjectId) {
    
  }

  @Router.delete("/users/profile/request")
  async rejectRequest(session: SessionDoc, toUser: ObjectId) {
    
  }

  // settings actions are static and can be included on the page 


  //directmessages
  @Router.patch("/users/directmessages/message")
  async makePrivateChat(session: SessionDoc, toUser: ObjectId, message: String) {
    
  }

  @Router.patch("/users/directmessages/groups")
  async makeGroupChat(session: SessionDoc, recipients: Array<ObjectId>, message: String) {
    
  }

  @Router.patch("/users/directmessages/deleteChat")
  async deleteChat(session: SessionDoc) {

  }







  



  //posts

  // @Router.post("/posts")
  // async createPost(session: SessionDoc, content: string, options?: PostOptions) {
  //   const user = Sessioning.getUser(session);
  //   const created = await Posting.create(user, content, options);
  //   return { msg: created.msg, post: await Responses.post(created.post) };
  // }

  // @Router.get("/posts")
  // @Router.validate(z.object({ author: z.string().optional() }))
  // async getPosts(author?: string) {
  //   let posts;
  //   if (author) {
  //     const id = (await Authing.getUserByUsername(author))._id;
  //     posts = await Posting.getByAuthor(id);
  //   } else {
  //     posts = await Posting.getPosts();
  //   }
  //   return Responses.posts(posts);
  // }

  // @Router.patch("/posts/:id")
  // async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
  //   const user = Sessioning.getUser(session);
  //   const oid = new ObjectId(id);
  //   await Posting.assertAuthorIsUser(oid, user);
  //   return await Posting.update(oid, content, options);
  // }

  // @Router.delete("/posts/:id")
  // async deletePost(session: SessionDoc, id: string) {
  //   const user = Sessioning.getUser(session);
  //   const oid = new ObjectId(id);
  //   await Posting.assertAuthorIsUser(oid, user);
  //   return Posting.delete(oid);
  // }

  // @Router.get("/friends")
  // async getFriends(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Authing.idsToUsernames(await Friending.getFriends(user));
  // }

  // @Router.delete("/friends/:friend")
  // async removeFriend(session: SessionDoc, friend: string) {
  //   const user = Sessioning.getUser(session);
  //   const friendOid = (await Authing.getUserByUsername(friend))._id;
  //   return await Friending.removeFriend(user, friendOid);
  // }

  // @Router.get("/friend/requests")
  // async getRequests(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Responses.friendRequests(await Friending.getRequests(user));
  // }

  // @Router.post("/friend/requests/:to")
  // async sendFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.sendRequest(user, toOid);
  // }

  // @Router.delete("/friend/requests/:to")
  // async removeFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.removeRequest(user, toOid);
  // }

  // @Router.put("/friend/accept/:from")
  // async acceptFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.acceptRequest(fromOid, user);
  // }

  // @Router.put("/friend/reject/:from")
  // async rejectFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.rejectRequest(fromOid, user);
  // }



}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
