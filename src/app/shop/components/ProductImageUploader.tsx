import React, { memo } from "react"
import { Box, Typography, Grid, IconButton, TextField, MenuItem, Button } from "@mui/material"
import { CloudUpload, DeleteOutline } from "@mui/icons-material"
import Image from "next/image"

export type FileWithPreview = {
  file: File
  preview: string
  attributeValueId: number | null
}

interface ProductImageUploaderProps {
  selectedFiles: FileWithPreview[]
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onRemoveAllFiles: () => void
  onFileAttributeChange: (index: number, attributeValueId: number | null) => void
  selectableAttributeValues: { id: number; label: string }[]
}

const ProductImageUploader = memo(function ProductImageUploader({
  selectedFiles,
  onImageChange,
  onRemoveFile,
  onRemoveAllFiles,
  onFileAttributeChange,
  selectableAttributeValues,
}: ProductImageUploaderProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-slate-50/50 transition-all cursor-pointer bg-slate-50/20"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <CloudUpload sx={{ color: "text.secondary", fontSize: 40, mb: 1 }} />
          <Typography variant="body2" fontWeight="medium" color="text.secondary">
            <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            SVG, PNG, JPG, GIF, MP4, or WEBM
          </Typography>
        </div>
        <input
          id="dropzone-file"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={onImageChange}
        />
      </label>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <Button
              variant="text"
              color="error"
              size="small"
              startIcon={<DeleteOutline />}
              onClick={onRemoveAllFiles}
              sx={{ textTransform: "none" }}
            >
              Remove All
            </Button>
          </Box>
          <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }} className="scrollbar-seamless">
            <Grid container spacing={2}>
              {selectedFiles.map((fileObj, index) => {
                const isVideo =
                  fileObj.file.type.startsWith("video/") ||
                  fileObj.file.name.match(/\.(mp4|webm|ogg)$/i)

                return (
                  <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={index}>
                    <Box
                      sx={{
                        p: 1,
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        bgcolor: "white",
                      }}
                    >
                      <div className="relative w-full pt-[100%] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        {isVideo ? (
                          <video
                            src={fileObj.preview}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                            controls
                            muted
                          />
                        ) : (
                          <Image
                            src={fileObj.preview}
                            alt="preview"
                            fill
                            unoptimized
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemoveFile(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.9)",
                            "&:hover": { bgcolor: "white" },
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </div>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        label="Assign to Variant"
                        value={fileObj.attributeValueId ?? ""}
                        onChange={(e) =>
                          onFileAttributeChange(
                            index,
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {selectableAttributeValues.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  )
})
export default ProductImageUploader
