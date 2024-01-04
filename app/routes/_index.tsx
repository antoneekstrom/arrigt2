import { Link, useLoaderData } from "@remix-run/react";
import { gql } from "../__generated__/graphql";
import { loadQuery } from "../helpers/form.server";
import { LoaderFunctionArgs } from "@remix-run/node";

const loaderQuery = gql(`
    query HomePageLoader {
      allEvents {
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
  const { data, errors } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>arrIgT</h1>
      {errors?.map((error, i) => <div key={i}>{JSON.stringify(error)}</div>)}
      <ul>
        {data?.allEvents.map((event) => (
          <li key={event.id}>
            <a href={`/arr/${event.id}`}>{event.title}</a>
          </li>
        ))}
      </ul>
      <Link to="/arr/new">New arr</Link>
    </div>
  );
}
