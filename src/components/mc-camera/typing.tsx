export interface McCameraData {
  mode: "photo" | "video" | "docx";
  active: number;
  images: IScanImage[];
}
