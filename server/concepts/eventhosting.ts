import { ObjectId, TopologyDescription } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";
import {Sessioning, Profiling} from "../app";

export interface EventHostDoc extends BaseDoc {
  organizer: ObjectId;
  title: string;
  description: string;
  date: number;
  spots: number;
  signups: Array<string>;
  waitlists: Array<string>;
  tags: string;
}

// export interface EventFiltersDoc extends BaseDoc {

// }

/**
 * concept: EventHosting [User]
 */
export default class EventHostingConcept {
  public readonly events: DocCollection<EventHostDoc>;
  // public readonly filters: DocCollection<EventFiltersDoc>;

  /**
   * Make an instance of EventHosting.
   */
  constructor(collectionName: string) {
    this.events = new DocCollection<EventHostDoc>(collectionName);
  }

  async create(organizer: ObjectId, title: string, description: string, date: number, spots: number) {
    await this.assertGoodFields(title, description, date, spots);
    const signups = new Array<string>();
    const waitlists = new Array<string>();
    const tags = ""
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

  async getEventSignups(_id: ObjectId) {
    return await this.events.readOne({ _id }) 
  }


  async addTag(_id: ObjectId, tag: string) {
    //organizer add tags to event
    if (tag.split(" ").length !== 1) {
      throw new NotAllowedError("Tag has to be one word");
    }
    const event = await this.events.readOne({ _id });
    const newtags = event?.tags + ", " + tag;
    await this.events.partialUpdateOne({ _id }, {tags:newtags});
    return { msg: "Tags succesfully updated"};
  }

  async delete(_id: ObjectId) {
    //delete event 
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

  async signup(userid: ObjectId, _id: ObjectId) {
    const event = await this.events.readOne({ _id })
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    if (event.signups.includes(userid.toString())) {
      throw new NotAllowedError("User already signed up for event");
    }
    if (event.signups.length >= event.spots) {
      throw new NotAllowedError("Spots full please join waitlist");
    }
    const newsignups = event.signups;
    await newsignups.push(userid.toString());
    await this.events.partialUpdateOne({ _id:_id }, {signups: newsignups});    
    
    await Profiling.signup(userid, _id);
    return { msg: "Successfully signed up for event!"};
  }

  async waitlist(userid: ObjectId, _id: ObjectId) {
    const event = await this.events.readOne({ _id })
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    if (event.signups.toString().includes(userid.toString())) {
      throw new NotAllowedError("User already signed up for event");
    }
    if (event.waitlists.toString().includes(userid.toString())) {
      throw new NotAllowedError("User already waitlisted for event");
    }
    const newwaitlists = event.waitlists;
    await newwaitlists.push(userid.toString());
    await this.events.partialUpdateOne({ _id:_id }, {waitlists: newwaitlists});    
    
    await Profiling.waitlist(userid, _id);
    return { msg: "Successfully waitlisted for event!", position: event.waitlists.length};
  }

  async removeSignup(userid: ObjectId, _id: ObjectId) {
    const event = await this.events.readOne({ _id })
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    if (!event.signups.toString().includes(userid.toString())) {
      throw new NotFoundError("User never signed up for event");
    }

    const newsignups = event.signups;
    const index = newsignups.indexOf(userid.toString());
    newsignups.splice(index, 1);
    await this.events.partialUpdateOne({ _id:_id }, {signups: newsignups});    
    
    await Profiling.removeSignup(userid, _id);
    return { msg: "Successfully removed event signup!"};
  }

  async removeWaitlist(userid: ObjectId, _id: ObjectId) {
    const event = await this.events.readOne({ _id })
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    if (event.signups.toString().includes(userid.toString())) {
      throw new NotAllowedError("User is signed up, not waitlisted, for event");
    }
    if (!event.waitlists.toString().includes(userid.toString())) {
      throw new NotFoundError("User never waitlisted for event");
    }

    const newwaitlists = event.waitlists;
    const index = newwaitlists.indexOf(userid.toString());
    newwaitlists.splice(index, 1);
    await this.events.partialUpdateOne({ _id:_id }, {waitlists: newwaitlists});    
    
    await Profiling.removeWaitlist(userid, _id);
    return { msg: "Successfully removed event waitlist!"};
  }

  async addFilter(userid: ObjectId, filter: string) {
    const filterWords = await Profiling.addFilter(userid, filter);
    const filtering = {
      $or: [
        { tags: { $in: filterWords } }, // Matches if any tag matches a filter word
        { title: { $regex: new RegExp(filterWords.join('|')) }}, // Matches title
        { description: { $regex: new RegExp(filterWords.join('|')) }} // Matches description
      ]
    };
    const events = await this.events.readMany(filtering);
    return { msg: "Filter added and events filtered!", events: events};

  }

  async removeFilter(userid: ObjectId, filter: string) {
    const filterWords = await Profiling.removeFilter(userid, filter);
    const filtering = {
      $or: [
        { tags: { $in: filterWords } }, // Matches if any tag matches a filter word
        { title: { $regex: new RegExp(filterWords.join('|')) }}, // Matches title
        { description: { $regex: new RegExp(filterWords.join('|')) }} // Matches description
      ]
    };
    const events = await this.events.readMany(filtering);
    return { msg: "Filter removed and events filtered!", events: events};
  }


  async resetFilters(userid: ObjectId) {
    const filterWords = await Profiling.resetFilters(userid);
    const filtering = {
      $or: [
        { tags: { $in: filterWords } }, // Matches if any tag matches a filter word
        { title: { $regex: new RegExp(filterWords.join('|')) }}, // Matches title
        { description: { $regex: new RegExp(filterWords.join('|')) }} // Matches description
      ]
    };
    const events = await this.events.readMany(filtering);
    return { msg: "Filters reset! Displaying all events.", events: events};
  }

  async getEventById(_id: ObjectId) {
    return await this.events.readOne({ _id });
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
