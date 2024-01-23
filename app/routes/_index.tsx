import { Link, useLoaderData } from "@remix-run/react";
import { gql } from "../__generated__/graphql";
import { loadQuery } from "../helpers/form.server";
import { LoaderFunctionArgs } from "@remix-run/node";

const loaderQuery = gql(`
    query HomePageLoader {
      allPublishedEvents {
        id
        title
        dateTime
        location
      }
    }
`);

export function loader(args: LoaderFunctionArgs) {
  return loadQuery(args, {
    query: loaderQuery,
  });
}

export default function Home() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>arrIgT</h1>
      <ul>
        {data?.allPublishedEvents.map((event) => (
          <li key={event.id}>
            <a href={`/arr/${event.id}`}>{event.title}</a>
          </li>
        ))}
      </ul>
      <Link to="/arr/new">New arr</Link>
    </div>
  );
}
