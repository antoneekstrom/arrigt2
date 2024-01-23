import { LoaderFunctionArgs } from "@remix-run/node";
import { gql } from "../../__generated__/graphql";
import { loadQuery } from "../../helpers/form.server";
import { useLoaderData } from "@remix-run/react";

const loaderQuery = gql(`
  query ManagePageLoader {
    allEvents {
      id
      isDraft
    }
  }
`);

export async function loader(args: LoaderFunctionArgs) {
  const result = await loadQuery(args, {
    query: loaderQuery,
  });
  return result;
}

export default function ManagePage() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Manage Page</h1>
      <ul>
        {data.allEvents.map((event) => (
          <li key={event.id}>
            {event.id} {event.isDraft ? "Draft" : "Published"}
          </li>
        ))}
      </ul>
    </div>
  );
}
