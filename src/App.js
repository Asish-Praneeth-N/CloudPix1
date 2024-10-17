import React, { useState, useEffect } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [password, setPassword] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const imagesRef = ref(storage, 'images');
      const imageList = await listAll(imagesRef);
      const imageURLs = await Promise.all(
        imageList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { id: item.name, name: item.name, src: url };
        })
      );
      setImages(imageURLs);
    } catch (error) {
      console.error("Error fetching images:", error);
      alert("Failed to fetch images. Please check your connection and try again.");
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width * 0.8;
          canvas.height = img.height * 0.8;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(resolve, file.type, 0.8);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, compressedFile);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    fetchImages();
  };

  const handleDelete = async () => {
    if (password === 'Confirm@deletion') {
      for (const imageId of selectedForDeletion) {
        const imageRef = ref(storage, `images/${imageId}`);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image:", error);
          alert(`Failed to delete ${imageId}. Please try again.`);
        }
      }
      setSelectedForDeletion([]);
      setShowDeleteConfirmation(false);
      fetchImages();
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CloudPix</h1>
      </header>
      <main>
        <section className="upload-section">
          <input
            type="file"
            onChange={handleUpload}
            multiple
            accept="image/*"
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="upload-button">
            Upload Images
          </label>
          <button onClick={() => setShowGallery(true)} className="gallery-button">
            View Gallery
          </button>
        </section>
        
        <section className="file-list-section">
          <h2>Uploaded Files</h2>
          <ul className="file-list">
            {images.map((image) => (
              <li key={image.id} className="file-item">
                <span className="file-name">{image.name}</span>
                <div className="file-actions">
                  <input
                    type="checkbox"
                    id={`delete-${image.id}`}
                    checked={selectedForDeletion.includes(image.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForDeletion([...selectedForDeletion, image.id]);
                      } else {
                        setSelectedForDeletion(selectedForDeletion.filter(id => id !== image.id));
                      }
                    }}
                  />
                  <label htmlFor={`delete-${image.id}`}>Delete</label>
                </div>
              </li>
            ))}
          </ul>
          {selectedForDeletion.length > 0 && (
            <button onClick={() => setShowDeleteConfirmation(true)} className="delete-button">
              Delete Selected ({selectedForDeletion.length})
            </button>
          )}
        </section>
      </main>

      {showGallery && (
        <div className="overlay" onClick={() => setShowGallery(false)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <h2>Gallery</h2>
            <div className="image-grid">
              {images.map((image) => (
                <div key={image.id} className="image-item">
                  <img src={image.src} alt={image.name} />
                </div>
              ))}
            </div>
            <button onClick={() => setShowGallery(false)} className="close-button">
              Close Gallery
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Confirm Deletion</h3>
            <p>Enter password to delete selected images:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <div className="delete-actions">
              <button onClick={handleDelete} className="action-button delete-button">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirmation(false)} className="action-button cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;