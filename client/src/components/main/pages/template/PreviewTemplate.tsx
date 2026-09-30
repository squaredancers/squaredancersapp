import { Box, Button, TextField, Typography } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import useRootTemplateStore from "../../../../stores/useRootTemplateStore.js";

const PreviewText = (props: { previewText: string }) => {
  const splitLineText = props.previewText.split("\n");

  return (
    <>
      {splitLineText.map((text, index) => {
        if (index === splitLineText.length - 1) {
          return <Fragment key={"frag" + index}>{text}</Fragment>;
        } else {
          return (
            <Fragment key={"frag" + index}>
              {text}
              <br />
            </Fragment>
          );
        }
      })}
    </>
  );
};

const PreviewTemplate = () => {
  const setPreviewOpen = useRootTemplateStore((state) => state.setPreviewOpen);
  const useTemplateRoot = useRootTemplateStore((state) => state.templateRoot);
  const useVariableRoot = useRootTemplateStore((state) => state.variableRoot);
  const variables = useVariableRoot((state) => state.childItems);
  const [nameValues, setNameValues] = useState<{ [name: string]: string }>({});
  const handleValueChange = (name: string, value: string) => {
    const updatedNameValues = { ...nameValues };

    updatedNameValues[name] = value;
    setNameValues(updatedNameValues);
  };
  const previewText = useMemo(() => {
    let previewTextResult = useTemplateRoot
      .getState()
      .getPreviewText(nameValues)
      .join(" ");

    // Now substitute any variables that might be in the text
    Object.keys(nameValues).forEach((name) => {
      const varName = `*|${name}|*`;
      const value = nameValues[name];

      previewTextResult = previewTextResult.replaceAll(varName, value);
    });

    return previewTextResult;
  }, [nameValues]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: "10px",
        }}
      >
        <Typography fontWeight="bold">Preview page</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: "10px",
        }}
      >
        <Box
          sx={{
            flex: "0 0 33.333%",
            maxWidth: "33.333%",
          }}
        >
          {variables.map((varStore) => {
            const name = varStore.getState().name;
            const value = nameValues[name];
            const label = `${name} value`;

            return (
              <TextField
                label={label}
                key={label}
                name={label}
                required={true}
                value={value ?? ""}
                onChange={(event) =>
                  handleValueChange(name, event.target.value)
                }
                fullWidth
                size="small"
                margin="dense"
              />
            );
          })}
        </Box>
        <Box
          sx={{
            flex: "0 0 66.666%",
            maxWidth: "66.666%",
            gap: "5px",
          }}
        >
          <Typography fontWeight="bold">Preview text</Typography>
          <div
            style={{
              textAlign: "left",
              border: "2px solid black",
              padding: "5px",
            }}
          >
            <PreviewText previewText={previewText} />
          </div>
        </Box>
      </Box>
      <Box>
        <Button variant="contained" onClick={() => setPreviewOpen(false)}>
          Ok
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewTemplate;
