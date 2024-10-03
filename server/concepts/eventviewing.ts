import { ObjectId, TopologyDescription } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import {Sessioning} from "../app";

export interface EventViewDoc extends BaseDoc {
    user: ObjectId
}

/**
 * concept: EventViewing [User]
 */
export default class EventViewingConcept {
  public readonly events: DocCollection<EventViewDoc>;

  /**
   * Make an instance of EventViewing.
   */
  constructor(collectionName: string) {
    this.events = new DocCollection<EventViewDoc>(collectionName);
  }

  async signup(user: ObjectId, event: ObjectId) {

  }

  async waitlist(user: ObjectId, event: ObjectId) {

  }

  async removeSignup(user: ObjectId, event: ObjectId) {

  }

  async removeWaitlist(user: ObjectId, event: ObjectId) {

  }

  async addFilter(user: ObjectId, filter: string) {

  }

  async removeFilter(user: ObjectId, filter: string) {

  }

  async resetFilters(user: ObjectId){

  }

  async sortbyNewest(user: ObjectId) {

  }

}
