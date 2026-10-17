import axios from "axios";

// A message for the person searching: plain words, never the API's raw text or internal details.
export interface SearchError {
  title: string;
  hint?: string;
  // The field at fault, marked with aria-invalid.
  field?: "location" | "dates";
}

const DATE_HINT = "Pick the dates again with the date picker.";

// Map the API's 400 messages (docs/api.md) to plain words.
function badRequest(message: string | undefined): SearchError {
  switch (message) {
    case "Missing parameters":
      return { title: "Please fill in all fields." };
    case "Invalid location":
      return {
        title: "We couldn't find that place.",
        hint: 'Try a more specific name, for example "Santiago, Chile".',
        field: "location",
      };
    case "Invalid date format":
      return { title: "One of the dates is not valid.", hint: DATE_HINT, field: "dates" };
    case "Invalid date range":
      return { title: "The start date must be before the end date.", field: "dates" };
    case "Date range cannot exceed 366 days":
      return { title: "The range is too long.", hint: "Search up to 366 days at a time.", field: "dates" };
  }
  if (message?.endsWith("exceeds the allowed future limit (10 years from today).")) {
    return { title: "That date is too far ahead.", hint: "Search up to 10 years from today.", field: "dates" };
  }
  return { title: "Please check the search and try again." };
}

export function searchError(error: unknown): SearchError {
  if (axios.isAxiosError<{ error?: string }>(error) && error.response) {
    const { status, data } = error.response;
    if (status === 400) return badRequest(data?.error);
    if (status === 404) {
      return { title: "No sun times for this place and dates.", hint: "Try other dates or try again later." };
    }
    if (status === 429) return { title: "Too many searches.", hint: "Wait a minute and try again." };
    return { title: "Something went wrong on our side.", hint: "Please try again in a moment." };
  }
  if (axios.isAxiosError(error) && error.request) {
    return { title: "We couldn't reach the server.", hint: "Check your connection and try again." };
  }
  return { title: "Something went wrong.", hint: "Please try again." };
}
