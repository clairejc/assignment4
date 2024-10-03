import { ObjectId, TopologyDescription } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import {Sessioning} from "../app";

export interface EventHostDoc extends BaseDoc {
    user: ObjectId;
    signedup: Array<ObjectId>
}

/**
 * concept: EventHosting [User]
 */
export default class EventHostingConcept {
  public readonly events: DocCollection<EventHostDoc>;

  /**
   * Make an instance of EventHosting.
   */
  constructor(collectionName: string) {
    this.events = new DocCollection<EventHostDoc>(collectionName);
  }

  async create(organizer: ObjectId, title: string, description: string, date: number, spots: number, tags?: Array<string>) {
    await this.assertGoodFields(title, description, date, spots);
    const signups = Array<ObjectId>;
    const waitlists = Array<ObjectId>;
    const _id = await this.events.createOne({ organizer, title, description, date, spots, signups, waitlists, tags});
    return { msg: "Event successfully created!", event: await this.events.readOne({ _id }) };
  }

  async update(_id: ObjectId, description: string) {
    await this.events.partialUpdateOne({ _id }, { description:description });
    return { msg: "Event successfully updated!" };
  }
 
  async getAllEvents() {
    // Returns all events! 
    return await this.events.readMany({}, { sort: { _id: -1 } });
  }

  async getByOrganizer(organizer: ObjectId) {
    return await this.events.readMany({ organizer:organizer });
  }

  async updateDescription(_id: ObjectId, newDescription: string) {
    await this.events.partialUpdateOne({ _id }, { description: newDescription });
    return { msg: "Event successfully updated!" };
  }

  private async assertGoodFields(title: string, description: string, date: number, spots: number) {
    if (!title || !description || !date || !spots) {
      throw new BadValuesError("Title, description, date, spots must be non-empty!");
    }
    await this.assertTitleUnique(title);
  }

  private async assertTitleUnique(title: string) {
    if (await this.events.readOne({ title })) {
      throw new NotAllowedError(`Event with title ${title} already exists!`);
    }
  }

  async delete(_id: ObjectId) {
    //delete event by
    await this.events.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertOrganizerIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.events.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.organizer.toString() !== user.toString()) {
      throw new EventOrganizerNotMatchError(user, _id);
    }
  }
}

export class EventOrganizerNotMatchError extends NotAllowedError {
  constructor(
    public readonly organizer: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", organizer, _id);
  }
}
