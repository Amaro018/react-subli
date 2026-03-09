import CelebrationIcon from "@mui/icons-material/Celebration"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import ForestIcon from "@mui/icons-material/Forest"
import ConstructionIcon from "@mui/icons-material/Construction"
import CheckroomIcon from "@mui/icons-material/Checkroom"
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly"
import CategoryIcon from "@mui/icons-material/Category"
import { SvgIconComponent } from "@mui/icons-material"

export const categoryIconMap: Record<string, SvgIconComponent> = {
  party: CelebrationIcon,
  camera: CameraAltIcon,
  transport: DirectionsCarIcon,
  camping: ForestIcon,
  tools: ConstructionIcon,
  fashion: CheckroomIcon,
  sports: SportsSoccerIcon,
  baby: ChildFriendlyIcon,

  // fallback
  default: CategoryIcon,
}
