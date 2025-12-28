
export interface MediaUploadRef {
  uploadFile: () => Promise<number | undefined>; // Returns media ID
  clearFile: () => void;
}



