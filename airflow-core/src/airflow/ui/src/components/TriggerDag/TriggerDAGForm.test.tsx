/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Wrapper } from "src/utils/Wrapper";

import TriggerDAGForm from "./TriggerDAGForm";

const dagParams = vi.hoisted(() => ({
  paramsDict: {
    names: {
      description: "Names",
      schema: {
        items: { type: "string" },
        title: "Names to greet",
        type: "array",
      },
      value: ["Linda"],
    },
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "configForm.advancedOptions": "Advanced Options",
      })[key] ?? key,
  }),
}));

vi.mock("src/queries/useDagParams", () => ({
  useDagParams: () => dagParams,
}));

vi.mock("src/queries/useTogglePause", () => ({
  useTogglePause: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock("../DateTimeInput", () => ({
  DateTimeInput: ({ value = "" }: { value?: string }) => <input readOnly value={value} />,
}));

vi.mock("../JsonEditor", () => ({
  JsonEditor: ({
    value = "",
    onBlur,
    onChange,
  }: {
    value?: string;
    onBlur?: () => void;
    onChange?: (value: string) => void;
  }) => (
    <textarea
      aria-label="Configuration JSON"
      onBlur={onBlur}
      onChange={(event) => onChange?.(event.target.value)}
      value={value}
    />
  ),
}));

describe("TriggerDAGForm", () => {
  it("syncs Advanced Options JSON after Run Parameters edits in prefilled re-trigger mode", async () => {
    const { container } = render(
      <TriggerDAGForm
        dagDisplayName="Params Trigger UI"
        dagId="example_params_trigger_ui"
        error={undefined}
        hasSchedule={false}
        isPartitioned={false}
        isPaused={false}
        isPending={false}
        onSubmitTrigger={vi.fn()}
        open
        prefillConfig={{
          conf: {
            names: ["Paul"],
          },
          logicalDate: undefined,
          runId: "manual__test",
        }}
      />,
      { wrapper: Wrapper },
    );

    await screen.findByText("Names to greet");
    const namesField = container.querySelector<HTMLTextAreaElement>('textarea[name="element_names"]');

    expect(namesField).toBeInTheDocument();

    fireEvent.change(namesField as HTMLTextAreaElement, { target: { value: "P" } });
    fireEvent.click(screen.getByText("Advanced Options"));

    await waitFor(() => {
      const configJson = screen.getByLabelText("Configuration JSON") as HTMLTextAreaElement;

      expect(configJson.value).toContain('"P"');
    });
  });
});
