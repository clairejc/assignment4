import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import { Authing } from "../app";


export interface ProfileDoc extends BaseDoc {
    userid: ObjectId;
    username: string;
    password: string;
    name: string;
    phone: number;
    age: number;
    city?: string;
    state?: string;
    language?: string; 
    signedup: Array<string>;
    waitlisted: Array<string>;
    filters: Array<string>;
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

  async create(userid: ObjectId, username: string, password: string, name: string, phone: number, age: number, city?: string, state?: string, language?: string){
    const signedup: Array<string> = new Array<string>();
    const waitlisted: Array<string> = new Array<string>();
    const filters: Array<string> = new Array<string>();
    const _id = await this.profiles.createOne({ userid, username, password, name, phone, age, city, state, language, signedup, waitlisted, filters });
    return { profile: _id }
  }

  async updatePassword(userid: ObjectId, currentPassword: string, newPassword: string) {
    const profile = await this.profiles.readOne({ userid: userid });
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    if (profile.password !== currentPassword) {
      throw new NotAllowedError("The given current password is wrong!");
    }

    await Authing.updatePassword(userid, currentPassword, newPassword);
    await this.profiles.partialUpdateOne({ userid: userid }, { password: newPassword });
    return { msg: "Password updated successfully!" };
  }

  async updateUsername(userid: ObjectId, username: string) {
    await this.assertUsernameUnique(username);
    await Authing.updateUsername(userid, username);
    await this.profiles.partialUpdateOne({ userid: userid }, { username:username });
    return { msg: "Username updated successfully!" };
  }

  async delete(userid: ObjectId){
    await Authing.delete(userid);
    await this.profiles.deleteOne({userid: userid});
    return { msg: "Profile deleted! "}
  }

  async updateLocation(userid: ObjectId, newCity?: string, newState?: string){
    await this.assertProfileExists(userid);
    if (newCity) {
      await this.profiles.partialUpdateOne({ userid:userid }, {city: newCity});
    }
    if (newState) {
      await this.profiles.partialUpdateOne({ userid:userid }, {state: newState});
    }
    console.log(await this.profiles.readOne({ userid:userid }));
    return { msg: "Location updated succesfully", profile: await this.profiles.readOne({ userid: userid })};
  }

  async updateLanguage(userid: ObjectId, newLanguage: string){
    await this.assertProfileExists(userid);
    await this.profiles.partialUpdateOne({ userid: userid }, {language: newLanguage});
    return { msg: "Language updated succesfully", profile: await this.profiles.readOne({ userid:userid })};
  }

  async signup(userid: ObjectId, eventid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    const newsignedup = profile.signedup;
    await newsignedup.push(eventid.toString());
    await this.profiles.partialUpdateOne({ userid:userid }, {signedup: newsignedup});
  }

  async waitlist(userid: ObjectId, eventid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    const newwaitlisted = profile.waitlisted;
    await newwaitlisted.push(eventid.toString());
    await this.profiles.partialUpdateOne({ userid:userid }, {waitlisted: newwaitlisted});
  }

  async removeSignup(userid: ObjectId, eventid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    const newsignedup = profile.signedup;
    const index = newsignedup.indexOf(eventid.toString());
    newsignedup.splice(index, 1);
    await this.profiles.partialUpdateOne({ userid:userid }, {signedup: newsignedup});    
  }

  async removeWaitlist(userid: ObjectId, eventid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    const newwaitlisted = profile.signedup;
    const index = newwaitlisted.indexOf(eventid.toString());
    newwaitlisted.splice(index, 1);
    await this.profiles.partialUpdateOne({ userid:userid }, {waitlisted: newwaitlisted});    
  }

  async getUsersProfileId(userid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    return profile._id;
  }

  async addFilter(userid: ObjectId, filter: string) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("User not found");
    }
    if (profile.filters.includes(filter)) {
      throw new NotAllowedError("Filter already exists");
    }
    const newfilters: Array<string> = profile.filters;
    await newfilters.push(filter);
    await this.profiles.partialUpdateOne({ userid:userid }, {filters: newfilters});
    return newfilters;
  }

  async removeFilter(userid: ObjectId, filter: string) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("User not found");
    }
    if (!profile.filters.includes(filter)) {
      throw new NotAllowedError("Filter does not exist");
    }
    const newfilters: Array<string> = profile.filters;
    const index = newfilters.indexOf(filter);
    newfilters.splice(index, 1);
    await this.profiles.partialUpdateOne({ userid:userid }, {filters: newfilters});
    return profile.filters;
  } 

  async clearFilters (userid: ObjectId) {
    const profile = await this.profiles.readOne({ userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    await this.profiles.partialUpdateOne({ userid:userid }, {filters: new Array<string>()});
    const profileUpdated = await this.profiles.readOne({ userid:userid });
    return profileUpdated?.filters;
  }

  async getSignedup (userid: ObjectId) {
    //get events you have signed up for
    const profile = await this.profiles.readOne( { userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    return profile.signedup;


  }

  async getWaitlisted (userid: ObjectId) {
    //get events you have waitlisted up for
    const profile = await this.profiles.readOne( { userid:userid });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }
    return profile.waitlisted;
  }

  private async assertUsernameUnique(username: string) {
    if (await this.profiles.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }

  private async assertProfileExists(userid: ObjectId) {
    const maybeProfile = await this.profiles.readOne({ userid });
    if (maybeProfile === null) {
      throw new NotFoundError("Profile not found");
    }
  }
}

