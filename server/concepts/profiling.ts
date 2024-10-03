import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import { Authing } from "../app";


export interface FriendshipDoc extends BaseDoc {
  user: ObjectId;
}

export interface ProfileDoc extends BaseDoc {
    userid: ObjectId;
    username: string;
    password: string;
    name: string;
    phone: number;
    birthday: string;
    location?: string;
    language?: string; 
}


/**
 * concept: Profiling
 */

export default class ProfilingConcept {
  public readonly profiles: DocCollection<ProfileDoc>;

   /**
   * Make an instance of Profiling.
   */
  constructor(collectionName: string) {
    this.profiles = new DocCollection<ProfileDoc>(collectionName);

    // Create index on username to make search queries for it performant
    void this.profiles.collection.createIndex({ username: 1 });

  } 

  async create(userid: ObjectId, username: string, password: string, name: string, phone: number, birthday: string, location?: string, language?: string){
      const _id = await this.profiles.createOne({userid, username, password, name, phone, birthday, location, language})

    }

  async updatePassword(userid: ObjectId, currentPassword: string, newPassword: string) {
    const profile = await this.profiles.readOne({ userid });

    if (!profile) {
      throw new NotFoundError("User not found");
    }
    const actual_id = profile._id;
    console.log(profile.password)
    if (profile.password !== currentPassword) {
      throw new NotAllowedError("The given current password is wrong!");
    }
    await Authing.updatePassword(userid, currentPassword, newPassword);
    await this.profiles.partialUpdateOne({ _id: actual_id }, { password: newPassword });
    console.log(this.profiles.readOne({_id:actual_id}))
    return { msg: "Password updated successfully!" };
  }

  async updateUsername(userid: ObjectId, username: string) {
    const profile = await this.profiles.readOne({ userid });

    if (!profile) {
      throw new NotFoundError("User not found");
    }
    const actual_id = profile._id;

    await this.assertUsernameUnique(username);
    await Authing.updateUsername(userid, username);
    await this.profiles.partialUpdateOne({ _id:actual_id }, { username:username });
    return { msg: "Username updated successfully!" };
  }


  async delete(userid: ObjectId){
    const profile = await this.profiles.readOne({ userid });

    if (!profile) {
      throw new NotFoundError("User not found");
    }
    const actual_id = profile._id;
    
    await Authing.delete(userid)
    await this.profiles.deleteOne({actual_id})
    return { msg: "Profile deleted! "}
  }

  async updateLocation(userid: ObjectId, newLocation: string){
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("User not found");
    }
    const actual_id = profile._id;
    await this.profiles.partialUpdateOne({ _id:actual_id }, {location: newLocation});
    return { msg: "Location updated succesfully", profile: await this.profiles.readOne({ _id:actual_id })};
  }
  async updateLanguage(userid: ObjectId, newLanguage: string){
    const profile = await this.profiles.readOne({ userid:userid });

    if (!profile) {
      throw new NotFoundError("User not found");
    }
    const actual_id = profile._id;
    await this.profiles.partialUpdateOne({ _id:actual_id }, {language: newLanguage});
    return { msg: "Language updated succesfully", profile: await this.profiles.readOne({ _id:actual_id })};
  }


  private async assertUsernameUnique(username: string) {
    if (await this.profiles.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }

  //events
  //create/join/filter events/ 

  //add event title

  // filter if the word is in the titles
  
}

