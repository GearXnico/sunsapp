import Icon from "./Icon";
import type { SearchError } from "../lib/errors";

interface ErrorMessageProps {
  id: string;
  error: SearchError;
}

function ErrorMessage({ id, error }: ErrorMessageProps) {
  return (
    <div id={id} className="alert" role="alert">
      <Icon name="alert" />
      <span>
        <b>{error.title}</b>
        {error.hint && ` ${error.hint}`}
      </span>
    </div>
  );
}

export default ErrorMessage;
