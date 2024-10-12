import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


export interface SettingDoc extends BaseDoc {
  userid: ObjectId,
  instructionsOn: boolean,
  color: number,
}

/**
 * concept: Setting
 */
export default class SettingConcept {
    public readonly settings: DocCollection<SettingDoc>;

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.settings = new DocCollection<SettingDoc>(collectionName);
  }

  async create(userid: ObjectId) {
    const instructionsOn = false;
    const color = 0xD3D3D3;
    await this.settings.createOne({ userid, instructionsOn, color }) 
  }

  async getCurrentSettings(userid: ObjectId) {
    const setting = await this.settings.readOne({ userid: userid } );
    console.log("getting", setting)
    if (!setting) {
      throw new NotFoundError("Settings for user doesn't exist");
    }
    return { msg: "User setting", setting: setting};
  }

  async toggleInstructions(userid: ObjectId) {
    const setting = await this.settings.readOne({ userid} );
    if (!setting) {
      throw new NotFoundError("Settings for user doesn't exist");
    }
    const curInstructions = setting.instructionsOn;
    await this.settings.partialUpdateOne({ userid: userid} , {instructionsOn: !curInstructions})
    return { msg: "Instructions toggled!", instructionsOn: curInstructions };
  }

  async changeColor(userid: ObjectId, hex: number) {
    console.log("HIII")
    console.log(hex)
    if (hex === undefined) {
      throw new NotAllowedError("Hex input is empty. Please provide an input.");
    }
    await this.settings.partialUpdateOne({ userid: userid} , {color: hex});
    return { msg: "Color has been changed!"};
  }

  async resetSettings(userid: ObjectId) {
    this.settings.popOne({ userid });
    this.create(userid);
    return { msg: "Settings reset!" };
  }
}
