import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";
import { Authing } from "../app";

export interface FriendshipDoc extends BaseDoc {
  user1: ObjectId;
  user2: ObjectId;
}

export interface FriendRequestDoc extends BaseDoc {
  from: ObjectId;
  to: ObjectId;
  status: "pending" | "rejected" | "accepted";
  message: string;
}


export interface FriendshipMessageDoc extends BaseDoc {
  from: ObjectId;
  to: ObjectId;
  content: string;

}

export interface FriendshipProfileDoc extends BaseDoc {
  userid: ObjectId;
  bio: string;
  genderPronouns: string;
  interests: Array<string>;
  age: number;
}


/**
 * concept: Friending [User]
 */
export default class FriendingConcept {
  public readonly profiles: DocCollection<FriendshipProfileDoc>;
  public readonly friends: DocCollection<FriendshipDoc>;
  public readonly requests: DocCollection<FriendRequestDoc>;
  public readonly messages: DocCollection<FriendshipMessageDoc>;

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.profiles = new DocCollection<FriendshipProfileDoc>(collectionName + "_profiles");
    this.friends = new DocCollection<FriendshipDoc>(collectionName);
    this.requests = new DocCollection<FriendRequestDoc>(collectionName + "_requests");
    this.messages = new DocCollection<FriendshipMessageDoc>(collectionName + "_messages");
  }

  async createProfile(userid: ObjectId, bio: string, genderPronouns: string) {
    const interests = Array<string>();
    const profile = await this.profiles.readOne({ userid:userid });
    console.log(profile)
    if (profile) {
      throw new NotAllowedError("FriendshipHub profile already exists");
    }

    const user = await Authing.getUserById(userid);
    if (!user) {
      throw new NotFoundError("User with userid {userid} not found!");
    }
    const age = user.age;
    if (age < 60) {
      throw new AgeRestrictionError(age);
    }
    await this.profiles.createOne({ userid, bio, genderPronouns, interests, age});
    return {msg: "FriendshipHub profile created!", profile: await this.profiles.readOne({ userid })}
  }

  async updateProfile(userid: ObjectId, newBio?: string, newPronouns?: string) {
    const profile = await this.profiles.readOne({ userid });
    if (!profile) {
      throw new NotAllowedError("FriendshipHub profile has not been created");
    }
    if (newBio) {
      await this.profiles.partialUpdateOne({ userid:userid }, {bio:newBio});
    }
    if (newPronouns) {
      await this.profiles.partialUpdateOne({ userid:userid }, {genderPronouns:newPronouns});
    }
    return { msg: "FriendshipHub profile updated!", profile: await this.profiles.readOne({ userid })}
  }

  async deleteProfile(userid: ObjectId) {
    await this.profiles.deleteOne({ userid:userid });
    return { msg: "FriendshipHub profile deleted!",}
  }

  async addInterest(userid: ObjectId, interest: string) {
    if (interest === undefined) {
      throw new NotAllowedError("Interest input is empty. Please provide an input.");
    }
    if (interest.split(" ").length !== 1) {
      throw new NotAllowedError("Interests must be one word.");
    }
    const profile = await this.profiles.readOne({ userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    if (profile.interests.includes(interest)) {
      throw new AlreadyAddedInterestError(interest);
    }
    const newinterests = profile.interests;
    newinterests.push(interest);
    await this.profiles.partialUpdateOne({ userid:userid }, {interests: newinterests});    
    return { msg: "Interest added", interests: profile.interests};
  }

  async removeInterest(userid: ObjectId, interest: string) {
    if (interest.split(" ").length !== 1) {
      throw new NotAllowedError("Interests must be one word.");
    }
    const profile = await this.profiles.readOne({ userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    if (!profile.interests.includes(interest)) {
      throw new InterestNotFound(interest);
    }
    const newinterests = profile.interests;
    const index = newinterests.indexOf(interest);
    newinterests.splice(index, 1);
    await this.profiles.partialUpdateOne({ userid:userid }, {interests: newinterests});    
    return { msg: "Interest removed", interests: profile.interests};
  }

  async getCompatibleFriends(userid: ObjectId) {
    const profile = await this.profiles.readOne({ userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    const filterInterests = profile.interests;
    const filtering = {
      $and: [
        { interests: { $in: filterInterests } }, // Matches if any profiles match a filter word
        { userid: { $ne: userid } },
      ]
    };
    const friends = await this.profiles.readMany(filtering);
    return { msg: "Compatible friends returned!", friends: friends};
  }

  async sendRequest(from: ObjectId, to: ObjectId, message?: string) {
    await this.canSendRequest(from, to);
    await this.requests.createOne({ from, to, message, status: "pending" });
    return { msg: "Sent request!" };
  }

  async acceptRequest(from: ObjectId, to: ObjectId) {
    let message: string = "";
    const request = await this.requests.popOne({from:from, to:to});
    if (request !== null) {
      if (request.message !== null) {
        message = request.message;
        await this.createMessage(from, to, request.message);
      }
    }
    await Promise.all([this.requests.createOne({ from, to, message, status: "accepted" }), this.addFriend(from, to)]);
    return { msg: "Accepted request!" };
  }

  async rejectRequest(from: ObjectId, to: ObjectId, message?: string) {
    await this.removePendingRequest(from, to);
    return { msg: "Rejected request." };
  }

  async removeRequest(from: ObjectId, to: ObjectId, message?: string) {
    await this.removePendingRequest(from, to);
    return { msg: "Removed sent request." };
  }

  async getAllRequests(user: ObjectId) {
    return await this.requests.readMany({
      $or: [{ from: user }, { to: user }],
    });
  }

  async sentRequests(user: ObjectId) {
    return await this.requests.readMany({ from: user});
  }

  async receivedRequests(user: ObjectId) {
    return await this.requests.readMany({ to: user, status: "pending" });
  }

  async getFriends(user: ObjectId) {
    const friendships = await this.friends.readMany({
      $or: [{ user1: user }, { user2: user }],
    });
    // Making sure to compare ObjectId using tostring()
    const output = await friendships.map((friendship) => (friendship.user1.toString() === user.toString() ? friendship.user2: friendship.user1));
    return output;
  }

  async removeFriend(user: ObjectId, friend: ObjectId) {
    //deleting from in Friendshiphub
    const friendship = await this.friends.popOne({
      $or: [
        { user1: user, user2: friend },
        { user1: friend, user2: user },
      ],
    });
    if (friendship === null) {
      throw new FriendNotFoundError(user, friend);
    }
    this.messages.deleteMany({
      $or: [{from: user, to: friend}, {from: friend, to: user}]
    })

    return { msg: "Unfriended!" };
  }

  async addFriend(user1: ObjectId, user2: ObjectId) {
    void this.friends.createOne({ user1, user2 });
  }

  private async removePendingRequest(from: ObjectId, to: ObjectId) {
    const request = await this.requests.popOne({ from, to, status: "pending" });
    if (request === null) {
      throw new FriendRequestNotFoundError(from, to);
    }
    return request;
  }

  async getChat(user: ObjectId, user2: ObjectId) {
    const chat = await this.messages.readMany({ $or: [
        { from: user, to: user2}, 
        { from: user2, to: user},
      ]
    });
    return { msg: "chat exchange", chat: chat};
  }

  async createMessage(from: ObjectId, to: ObjectId, content: string) {
    this.messages.createOne({ from:from, to:to, content:content })
    return { msg: "Message sent!"}
  }


  private async assertNotFriends(u1: ObjectId, u2: ObjectId) {
    const friendship = await this.friends.readOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    });
    if (friendship !== null || u1.toString() === u2.toString()) {
      throw new AlreadyFriendsError(u1, u2);
    }
  }

  private async canSendRequest(u1: ObjectId, u2: ObjectId) {
    await this.assertNotFriends(u1, u2);
    // check if there is pending request between these users
    const request = await this.requests.readOne({
      from: { $in: [u1, u2] },
      to: { $in: [u1, u2] },
      status: "pending",
    });
    if (request !== null) {
      throw new FriendRequestAlreadyExistsError(u1, u2);
    }
  }
}

export class FriendRequestNotFoundError extends NotFoundError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("Friend request from {0} to {1} does not exist!", from, to);
  }
}

export class FriendRequestAlreadyExistsError extends NotAllowedError {
  constructor(
    public readonly from: ObjectId,
    public readonly to: ObjectId,
  ) {
    super("Friend request between {0} and {1} pending!", from, to);
  }
}

export class FriendNotFoundError extends NotFoundError {
  constructor(
    public readonly user1: ObjectId,
    public readonly user2: ObjectId,
  ) {
    super("Friendship between {0} and {1} does not exist!", user1, user2);
  }
}

export class AlreadyFriendsError extends NotAllowedError {
  constructor(
    public readonly user1: ObjectId,
    public readonly user2: ObjectId,
  ) {
    super("{0} and {1} are already friends!", user1, user2);
  }
}

export class AlreadyAddedInterestError extends NotAllowedError {
  constructor(
    public readonly interest: string,
  ) {
    super("{filter} has already been added", interest);
  }
}

export class InterestNotFound extends NotFoundError {
  constructor(
    public readonly interest: string,
  ) {
    super("Interest does not exist and cannot be deleted", interest);
  }
}

export class ProfileNotFound extends NotFoundError {
  constructor(
    public readonly profile: string,
  ) {
    super("User profile does not exist and Elderly Friendship Hub profile cannot be created", profile);
  }
}


export class AgeRestrictionError extends NotAllowedError {
  constructor(
    public readonly age: number,
  ) {
    super("Age restricted, cannot access Elderly Friendship Hub", age);
  }
}