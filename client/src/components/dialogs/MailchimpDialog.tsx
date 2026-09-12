import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import useMailchimpDialogStore from "../../stores/useMailchimpDialogStore.js";

const MailchimpDialog = () => {
  const isOpen = useMailchimpDialogStore((state) => state.open);
  const setOpen = useMailchimpDialogStore((state) => state.setOpen);
  const text = useMailchimpDialogStore((state) => state.content);
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      // Use standard browser navigator clipboard API
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Reset the feedback icon back to copy icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(
        "Failed to copy text.  Try selecting the content and coping manually.",
        err,
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <DialogTitle> Mailchimp member data</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The text below can be imported into Mailchimp. Just click the copy
          button and paste it into Mailchimp.
        </DialogContentText>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "between",
            backgroundColor: (theme) => theme.palette.grey[50],
            borderRadius: 2,
          }}
        >
          {/* Text Container */}
          <Box sx={{ flexGrow: 1, mr: 2, overflow: "hidden" }}>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                margin: 0,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {text}
            </Typography>
          </Box>

          {/* Action Button */}
          <Tooltip
            title={copied ? "Copied!" : "Copy to clipboard"}
            placement="top"
          >
            <IconButton
              onClick={handleCopy}
              color={copied ? "success" : "default"}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              {copied ? (
                <CheckIcon fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MailchimpDialog;
