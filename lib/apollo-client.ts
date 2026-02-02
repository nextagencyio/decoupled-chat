import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: `${process.env.DRUPAL_BASE_URL || process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/graphql`,
})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
})

export default client
