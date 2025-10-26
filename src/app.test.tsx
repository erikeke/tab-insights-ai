import { render, screen, waitFor } from "@testing-library/react";

import App from "./app";

global.chrome = {
  // @ts-ignore
  runtime: {
    getURL: jest.fn(() => ""),
    sendMessage: jest.fn(),
  },
};

test("renders in the document", async () => {
  render(<App onClose={() => {}} />);

  const app = await screen.findByTestId("app");
  await waitFor(() => expect(app).toBeInTheDocument());
});
