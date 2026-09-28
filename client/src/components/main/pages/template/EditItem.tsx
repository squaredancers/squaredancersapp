import {
  Box,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import {
  NodeType,
  TreeItemStore,
} from "../../../../stores/templateFactoryStore.js";
import useRootTemplateStore from "../../../../stores/useRootTemplateStore.js";
import Conditional from "../../../common/Conditional.js";

const EditItem = (props: { itemStore: TreeItemStore | null }) => {
  const useItemStore = props.itemStore;
  const name = useItemStore?.((state) => state.name) ?? "";
  const setName = useItemStore?.((state) => state.setName);
  const text = useItemStore?.((state) => state.text) ?? "";
  const setText = useItemStore?.((state) => state.setText);
  const nodeType = useItemStore?.((state) => state.nodeType);
  const selectedVar = useItemStore?.((state) => state.fieldName);
  const setSelectedVar = useItemStore?.((state) => state.setFieldName);
  const varValue = useItemStore?.((state) => state.valueName) ?? "";
  const setVarValue = useItemStore?.((state) => state.setValueName);
  const useVariableRoot = useRootTemplateStore((state) => state.variableRoot)!;
  const variableStores = useVariableRoot((state) => state.childItems);
  const variables = variableStores.map((store) => store.getState().name);

  return (
    <Box>
      <Conditional condition={useItemStore !== null}>
        <Typography fontWeight="bold">Selected item details</Typography>
        <TextField
          label="Name"
          name="name"
          required={true}
          value={name}
          onChange={(event) => setName?.(event.target.value)}
          fullWidth
          margin="normal"
        />
        <Conditional condition={nodeType === NodeType.Text}>
          <TextareaAutosize
            aria-label="text area"
            value={text}
            onChange={(event) => setText?.(event.target.value)}
            minRows={6}
            placeholder="Enter text here"
            style={{ width: "100%" }}
          />
        </Conditional>
        <Conditional condition={nodeType === NodeType.Condition}>
          <FormControl fullWidth required={true}>
            <InputLabel id="user-label">
              {variables.length === 0 ? "No variables defined" : "Variable"}
            </InputLabel>
            <Select
              disabled={variables.length === 0}
              multiple={false}
              value={selectedVar}
              labelId="var-label"
              input={
                <OutlinedInput
                  label={
                    variables.length === 0 ? "No variables defined" : "Variable"
                  }
                />
              } // This prop handles the outlined input style and notches the border correctly
              onChange={(event) => {
                setSelectedVar?.(event.target.value);
              }}
            >
              {variables.map((variable) => {
                return (
                  <MenuItem key={variable} value={variable}>
                    <ListItemText primary={variable} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            label="Value"
            name="value"
            required={true}
            value={varValue}
            onChange={(event) => setVarValue?.(event.target.value)}
            fullWidth
            margin="normal"
          />
        </Conditional>
      </Conditional>
    </Box>
  );
};

export default EditItem;
