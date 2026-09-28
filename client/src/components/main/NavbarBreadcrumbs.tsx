import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useBreadcrumbStore from "../../stores/useBreadcrumbStore.js";
import usePageStore from "../../stores/usePageStore.js";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  color: "text.primary",
  fontWeight: "600",
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

export default function NavbarBreadcrumbs() {
  const page = usePageStore((state) => state.page);
  const breadcrumbs = useBreadcrumbStore((state) => state.breadcrumbs);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Triangle Squares Admin</Typography>
      <Typography variant="body1">{page}</Typography>
      {breadcrumbs.map((breadcrumb) => {
        return <Typography variant="body1">{breadcrumb}</Typography>;
      })}
    </StyledBreadcrumbs>
  );
}
