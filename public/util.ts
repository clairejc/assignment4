type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea" | "json";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type Operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

/**
 * This list of operations is used to generate the manual testing UI.
 */
const operations: Operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input", name: "input", phone: "input", age: "input"},
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },

  //profiles

  {
    name: "Update Password",
    endpoint: "/api/profiles/password",
    method: "PATCH",
    fields: { currentPassword: "input", newPassword: "input" },
  },

  {
    name: "Update Username",
    endpoint: "/api/profiles/username",
    method: "PATCH",
    fields: { username: "input" },
  },

  {
    name: "Update Location",
    endpoint: "/api/profiles/location",
    method: "PATCH",
    fields: { newCity: "input", newState: "input" },
  },

  {
    name: "Update Language",
    endpoint: "/api/profiles/language",
    method: "PATCH",
    fields: { newLanguage: "input" },
  },

  {
    name: "Delete User",
    endpoint: "/api/profiles",
    method: "DELETE",
    fields: {},
  },

  {
    name: "Get Signed Up Events",
    endpoint: "/api/profiles/signedup",
    method: "GET",
    fields: {},
  },

  {
    name: "Get Waitlisted Events",
    endpoint: "/api/profiles/waitlisted",
    method: "GET",
    fields: {},
  },


  //eventhosts

  {
    name: "Create Event",
    endpoint: "/api/eventhosts",
    method: "POST",
    fields: { title: "input", description: "input", date: "input", spots: "input"},
  },


  {
    name: "Update Event",
    endpoint: "/api/eventhosts/:id",
    method: "PATCH",
    fields: { id: "input", description: "input" },
  },

  {
    name: "Delete Event",
    endpoint: "/api/eventhosts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },


  {
    name: "Get Events (empty for all)",
    endpoint: "/api/eventhosts/",
    method: "GET",
    fields: { organizer: "input" },
  },

  {
    name: "Add Event Tag (One Word)",
    endpoint: "/api/eventhosts/tags/:id",
    method: "PATCH",
    fields: { id: "input", tag: "input"},
  },

  {
    name: "Event Signup",
    endpoint: "/api/eventhosts/signups/:id",
    method: "PATCH",
    fields: { id: "input"},
  },

  {
    name: "Event Waitlist",
    endpoint: "/api/eventhosts/waitlists/:id",
    method: "PATCH",
    fields: { id: "input"},
  },

  {
    name: "Event Remove Signup",
    endpoint: "/api/eventhosts/removesignups/:id",
    method: "DELETE",
    fields: { id: "input"},
  },

  {
    name: "Event Remove Waitlist",
    endpoint: "/api/eventhosts/removewaitlists/:id",
    method: "DELETE",
    fields: { id: "input"},
  },

  {
    name: "Add Event Filter (One Word)",
    endpoint: "/api/eventhosts/filters/add/:id",
    method: "PATCH",
    fields: { filter: "input"},
  },


  {
    name: "Remove Event Filter (One Word)",
    endpoint: "/api/eventhosts/filters/remove/:id",
    method: "DELETE",
    fields: { filter: "input"},
  },

  {
    name: "Reset Event Filters",
    endpoint: "/api/eventhosts/filters/reset/:id",
    method: "DELETE",
    fields: {},
  },



  //friending

  {
    name: "Create FriendshipHub Profile",
    endpoint: "/api/friend/profile",
    method: "POST",
    fields: { bio: "input", genderPronouns: "input"},
  },

  {
    name: "Update FriendshipHub Profile",
    endpoint: "/api/friend/profile",
    method: "PATCH",
    fields: { bio: "input", genderPronouns: "input"},
  },

  {
    name: "Delete FriendshipHub Profile",
    endpoint: "/api/friend/profile",
    method: "DELETE",
    fields: { },
  },

  {
    name: "Add Friendship Interest (One Word)",
    endpoint: "/api/friend/profile/addinterest",
    method: "PATCH",
    fields: { interest: "input" },
  },

  {
    name: "Remove Friendship Interest (One Word)",
    endpoint: "/api/friend/profile/removeinterest",
    method: "DELETE",
    fields: { interest: "input" },
  },

  {
    name: "Get Compatible Friends",
    endpoint: "/api/friend/profile/compatible",
    method: "GET",
    fields: { },
  },

  {
    name: "Send Friend Request",
    endpoint: "/api/friend/sendrequest/:to_id",
    method: "POST",
    fields: { to_id: "input", message: "input"},
  },

  {
    name: "Accept Friend Request",
    endpoint: "/api/friend/acceptrequest/:from",
    method: "PUT",
    fields: { from_id: "input"},
  },

  {
    name: "Reject Friend Request",
    endpoint: "/api/friend/rejectrequest/:from",
    method: "PUT",
    fields: { from_id: "input"},
  },

  {
    name: "Remove Sent Friend Request",
    endpoint: "/api/friend/removerequest/:to",
    method: "DELETE",
    fields: { to_id: "input"},
  },

  {
    name: "Get All Request Types",
    endpoint: "/api/friend/requests",
    method: "GET",
    fields: { },
  },

  {
    name: "Get Sent Requests",
    endpoint: "/api/friend/getsentrequests/:to",
    method: "GET",
    fields: { },
  },

  {
    name: "Get Received Requests",
    endpoint: "/api/friend/getreceivedrequests",
    method: "GET",
    fields: { },
  },
  
  {
    name: "Get All Friends",
    endpoint: "/api/friend/getfriends",
    method: "GET",
    fields: { },
  },

  {
    name: "Remove Friendship",
    endpoint: "/api/friend/removefriend/:to",
    method: "DELETE",
    fields: { to: "input"},
  },

  {
    name: "Send Message",
    endpoint: "/api/friend/profile/sendmessage/:to_id",
    method: "POST",
    fields: { to_id: "input", content: "input"},
  },

  {
    name: "Get Chat Exchange",
    endpoint: "/api/friend/profile/chat/:to_id",
    method: "GET",
    fields: { to_id: "input"},
  },
  
  // settings

  {
    name: "Get Current Settings",
    endpoint: "/api/setting",
    method: "GET",
    fields: { },
  },

  {
    name: "Toggle Instructions Setting",
    endpoint: "/api/setting/instruction",
    method: "PATCH",
    fields: { },
  },

  {
    name: "Change Base Color",
    endpoint: "/api/setting/color",
    method: "PATCH",
    fields: { hex: "input"},
  },

  {
    name: "Reset Settings",
    endpoint: "/api/setting",
    method: "PATCH",
    fields: { },
  },
  




  


  




  


  

  // posts (previously included)

  // {
  //   name: "Delete Post",
  //   endpoint: "/api/posts/:id",
  //   method: "DELETE",
  //   fields: { id: "input" },
  // },

  // {
  //   name: "Create Post",
  //   endpoint: "/api/posts",
  //   method: "POST",
  //   fields: { content: "input" },
  // },

  // {
  //   name: "Get Users (empty for all)",
  //   endpoint: "/api/users/:username",
  //   method: "GET",
  //   fields: { username: "input" },
  // },
  // {
  //   name: "Get Posts (empty for all)",
  //   endpoint: "/api/posts",
  //   method: "GET",
  //   fields: { author: "input" },
  // },
  
  // {
  //   name: "Update Post",
  //   endpoint: "/api/posts/:id",
  //   method: "PATCH",
  //   fields: { id: "input", content: "input", options: { backgroundColor: "input" } },
  // },

  //
  // ...
  //
];

/*
 * You should not need to edit below.
 * Please ask if you have questions about what this test code is doing!
 */

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      const htmlTag = tag === "json" ? "textarea" : tag;
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${htmlTag} name="${prefix}${name}"></${htmlTag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const op = operations.find((op) => op.endpoint === $endpoint && op.method === $method);
  const pairs = Object.entries(reqData);
  for (const [key, val] of pairs) {
    if (val === "") {
      delete reqData[key];
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = key.split(".").reduce((obj, key) => obj[key], op?.fields as any);
    if (type === "json") {
      reqData[key] = JSON.parse(val as string);
    }
  }

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
