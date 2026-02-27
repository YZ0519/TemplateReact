import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { useState } from "react";
import PhotoUploadWidget from "../../app/shared/components/PhotoUploadWidget";
import StarButton from "../../app/shared/components/StarButton";
import DeleteButton from "../../app/shared/components/DeleteButton";

export default function ProfilePhotos() {
  const { id } = useParams();
  const {
    photos,
    loadingPhotos,
    isCurrentUser,
    uploadPhoto,
    profile,
    setMainPhoto,
    deletePhoto,
  } = useProfile(id);
  const [editMode, setEditMode] = useState(false);

  const handlePhotoUpload = (file: Blob) => {
    uploadPhoto.mutate(file, {
      onSuccess: () => setEditMode(false),
    });
  };

  if (loadingPhotos) return <p className="text-gray-500">Loading photos...</p>;
  if (!photos) return <p className="text-gray-500">No photos found for this user</p>;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700">Photos</h3>
        {isCurrentUser && (
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-sm text-blue-600 hover:underline"
          >
            {editMode ? "Cancel" : "Add photo"}
          </button>
        )}
      </div>
      <hr className="border-gray-200 my-3" />

      {editMode ? (
        <PhotoUploadWidget uploadPhoto={handlePhotoUpload} loading={uploadPhoto.isPending} />
      ) : photos.length === 0 ? (
        <p className="text-gray-500">No photos added yet</p>
      ) : (
        <div className="grid grid-cols-6 gap-2 max-h-96 overflow-auto">
          {photos.map((item) => (
            <div key={item.id} className="relative">
              <img
                src={item.url.replace("/upload/", "/upload/w_164,h_164,c_fill,f_auto,g_face/")}
                alt="user photo"
                loading="lazy"
                className="w-full h-24 object-cover rounded"
              />
              {isCurrentUser && (
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0" onClick={() => setMainPhoto.mutate(item)}>
                    <StarButton selected={item.url === profile?.imageUrl} />
                  </div>
                  {profile?.imageUrl !== item.url && (
                    <div className="absolute top-0 right-0" onClick={() => deletePhoto.mutate(item.id)}>
                      <DeleteButton />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
