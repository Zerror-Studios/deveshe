import { MATERIALS } from "@/data/materials";
import MaterialIndexClient from "./MaterialIndexClient";

export default function MaterialIndexPage() {
  return <MaterialIndexClient materials={MATERIALS} />;
}
