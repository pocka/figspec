import { css, html, TemplateResult } from "lit-element";

export interface ErrorMessageProps {
  title: string;

  children?: string | TemplateResult;
}

export const ErrorMessage = ({ title, children }: ErrorMessageProps) => html`
  <p class="error">
    <span class="error-title">${title}</span>
    <span class="error-description">${children}</span>
  </p>
`;

export const styles = css`
  .error {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: 80%;
    padding: 0.75em 1em;

    background-color: var(--error-bg);
    border-radius: 4px;
    color: var(--error-fg);

    transform: translate(-50%, -50%);
  }

  .error-title {
    display: block;
    font-size: 0.8em;

    font-weight: bold;
    text-transform: capitalize;
  }

  .error-description {
    display: block;
    margin-block-start: 0.5em;
  }
`;
