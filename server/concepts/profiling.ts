import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface ProfileDoc extends BaseDoc {
    username: String;
    password: String;
    name: String;
    phone: number;
    age?: number;
    location?: String; 
}


/**
 * concept: Profile
 */

export default class ProfilingConcept {
  public readonly profiles: DocCollection<ProfileDoc>;

    /**
   * Make an instance of Authenticating.
   */
  constructor(collectionName: string) {
    this.profiles = new DocCollection<ProfileDoc>(collectionName);
    // Create index on username to make search queries for it performant
    void this.profiles.collection.createIndex({ username: 1 });

  }

  async create(_id: ObjectId, username: String, password: String, name: String, phone: number, age?: number, location?: String){
      await this.profiles.createOne({ _id, username, password, name, phone, age, location})
  }

  async updatePassword(_id: ObjectId, currentPassword: string, newPassword: string) {
    console.log("hi")
    const user = await this.profiles.readOne({ _id });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      if (user.password !== currentPassword) {
        throw new NotAllowedError("The given current password is wrong!");
      }
  
      await this.profiles.partialUpdateOne({ _id }, { password: newPassword });
      return { msg: "Password updated successfully!" };
    }

  async delete(username: String){
      await this.profiles.deleteOne({username})
      return { msg: "Profile deleted! "}
  }

  async updateLocation(_id: ObjectId, newLocation: String){
    await this.profiles.partialUpdateOne({ _id }, {location: newLocation});
    return { msg: "Location updated succesfully"};
  }

      
    
}

