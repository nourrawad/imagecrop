import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import { FaCloudDownloadAlt } from "react-icons/fa";
import "react-image-crop/dist/ReactCrop.css";
import { FaCropSimple } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoCaretBack, IoCaretForward } from "react-icons/io5";
import { IoIosRemoveCircle } from "react-icons/io";
import { BsCloudUpload, BsFiletypeJson } from "react-icons/bs";
import "./cropper.css";

export default function Cropper() {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 0 });
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  const [cropIdCounter, setCropIdCounter] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [noMoreImages, setNoMoreImages] = useState(false);
  const inputRef = useRef(null);

  const showPreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setNoMoreImages(false);
    } else {
      setNoMoreImages(true);
    }
  };

  const showNextImage = () => {
    if (selectedImageIndex < croppedImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setNoMoreImages(false);
    } else {
      setNoMoreImages(true);
    }
  };

  const deleteCroppedImage = (id) => {
    // Filter out the cropped image with the given id
    const updatedCroppedImages = croppedImages.filter(
      (croppedImage) => croppedImage.id !== id
    );
    // Update the state with the new array of cropped images
    setCroppedImages(updatedCroppedImages);
    if (selectedImageIndex >= updatedCroppedImages.length) {
      setSelectedImageIndex(updatedCroppedImages.length - 1);
      setNoMoreImages(true);
    }
  };

  const selectImage = (file) => {
    const newSrc = URL.createObjectURL(file);
    // Reset state for any new image
    setSrc(newSrc);
    setOutput(null);
    setImage(null);
    setCroppedImages([]);
    setCropIdCounter(1);
  };

  const downloadCroppedImage = () => {
    const currentCroppedImage = croppedImages[selectedImageIndex];
    const link = document.createElement("a");
    link.href = currentCroppedImage.base64Image;
    link.download = `cropped_image_${currentCroppedImage.id}.png`;
    link.click();
  };

  const cropImageNow = () => {
    if (!image) {
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Converting to base64
    const base64Image = canvas.toDataURL("image/jpeg");

    // Check if the same crop already exists in the list
    const isDuplicateCrop = croppedImages.some(
      (existingCrop) => existingCrop.base64Image === base64Image
    );

    if (!isDuplicateCrop) {
      // Set crop coordinates
      const cropCoordinates = {
        topLeft: { x: crop.x, y: crop.y },
        bottomRight: {
          x: crop.x + crop.width,
          y: crop.y + crop.height,
        },
      };

      // Generate a unique id for the cropped image based on the image's order
      const id = cropIdCounter;

      // Save the cropped image along with its coordinates and id
      setCroppedImages((prevCroppedImages) => [
        ...prevCroppedImages,
        { id, base64Image, coordinates: cropCoordinates },
      ]);

      // Increment the cropIdCounter for the next crop
      setCropIdCounter((prevCounter) => prevCounter + 1);
    }
  };

  const exportToJSON = () => {
    const exportedData = croppedImages.map((croppedImage) => ({
      id: croppedImage.id,
      coordinates: {
        topLeft: {
          x: croppedImage.coordinates.topLeft.x.toFixed(2),
          y: croppedImage.coordinates.topLeft.y.toFixed(2),
        },
        bottomRight: {
          x: croppedImage.coordinates.bottomRight.x.toFixed(2),
          y: croppedImage.coordinates.bottomRight.y.toFixed(2),
        },
      },
      width: (
        croppedImage.coordinates.bottomRight.x -
        croppedImage.coordinates.topLeft.x
      ).toFixed(2),
      height: (
        croppedImage.coordinates.bottomRight.y -
        croppedImage.coordinates.topLeft.y
      ).toFixed(2),
    }));

    const jsonContent = JSON.stringify(exportedData, null, 2);

    // Create a Blob containing the JSON data
    const blob = new Blob([jsonContent], { type: "application/json" });

    // Create a download link and trigger a click event to download the file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "croppedImgProperties.json";
    link.click();
  };

  const deleteInput = () => {
    // Reset the component's state
    setSrc(null);
    setOutput(null);
    setImage(null);
    setCroppedImages([]);
    setCropIdCounter(1);
    inputRef.current.value = "";
  };

  return (
    <div className="App">
      <div className="top-container">
        <div className="input-container">
          <input
            type="file"
            accept=".jpg, .jpeg, .png, .Jfif, .json"
            onChange={(e) => {
              selectImage(e.target.files[0]);
            }}
            hidden
            multiple={false}
            ref={inputRef}
          />
          {!src && (
            <>
              <BsCloudUpload
                color="#62929E"
                size={70}
                onClick={() => inputRef.current.click()}
                cursor="pointer"
              />
              <p>Upload an Image</p>
            </>
          )}
          {src && (
            <>
              <ReactCrop
                src={src}
                onImageLoaded={setImage}
                crop={crop}
                onChange={setCrop}
              />
            </>
          )}
        </div>
        <div className="icons-container">
          <FaCropSimple onClick={cropImageNow} className="icons" />
          <MdDelete onClick={deleteInput} className="icons" />
        </div>
      </div>
      <br />
      <div className="bottom-container">
        {output && <img src={output} alt="crp" />}
        {croppedImages.length > 0 && (
          <div key={croppedImages[selectedImageIndex].id}>
            <img
              src={croppedImages[selectedImageIndex].base64Image}
              alt={`crp-${croppedImages[selectedImageIndex].id}`}
            />
            <div>
              Id: {selectedImageIndex + 1}
              <br />
              Top-left: (
              {croppedImages[selectedImageIndex].coordinates.topLeft.x.toFixed(
                2
              )}
              ,
              {croppedImages[selectedImageIndex].coordinates.topLeft.y.toFixed(
                2
              )}
              )
              <br />
              Bottom-right: (
              {croppedImages[
                selectedImageIndex
              ].coordinates.bottomRight.x.toFixed(2)}
              ,
              {croppedImages[
                selectedImageIndex
              ].coordinates.bottomRight.y.toFixed(2)}
              )
              <br />
              Width:{" "}
              {(
                croppedImages[selectedImageIndex].coordinates.bottomRight.x -
                croppedImages[selectedImageIndex].coordinates.topLeft.x
              ).toFixed(2)}{" "}
              pixels
              <br />
              Height:{" "}
              {(
                croppedImages[selectedImageIndex].coordinates.bottomRight.y -
                croppedImages[selectedImageIndex].coordinates.topLeft.y
              ).toFixed(2)}{" "}
              pixels
              <br />
              <div className="control">
                <IoCaretBack
                  onClick={showPreviousImage}
                  className="bottom-icons"
                />
                <IoCaretForward
                  onClick={showNextImage}
                  className="bottom-icons"
                />
                <IoIosRemoveCircle
                  className="bottom-icons"
                  onClick={() =>
                    deleteCroppedImage(croppedImages[selectedImageIndex].id)
                  }
                />
                <FaCloudDownloadAlt
                  onClick={downloadCroppedImage}
                  className="bottom-icons"
                />
                <BsFiletypeJson
                  onClick={exportToJSON}
                  className="bottom-icons"
                />
                {noMoreImages && (
                  <p className="warning">No more images to display</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
