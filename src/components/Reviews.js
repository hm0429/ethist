// components/Reviews.js
import React, { useEffect, useState } from 'react';
import {getApps, initializeApp} from 'firebase/app';
import { collection, getDocs, getFirestore } from "firebase/firestore"; 

const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)

var app
if (!getApps()?.length) {
    app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Firestoreからレビューデータを取得する
    const fetchReviews = async () => {
      try {
        const response = await getDocs(collection(db, 'reviews'));
        const reviewsData = []
        response.forEach((doc) => {
            console.log(doc);
            reviewsData.push({
                id: doc.id,
                ...doc.data()
            })
        });
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // レーティングを星で表示するための関数
  const renderRatingStars = (rating) => {
    const filledStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return filledStars + emptyStars;
  };

  return (
    <div>
      <h1>Reviews</h1>
      <ul className="reviewsList">
        {reviews.map(review => (
          <li key={review.id} className="reviewItem">
            <h2 className="reviewTitle">{review.title}</h2>
            <p className="reviewBody">{review.body}</p>
            <p className="reviewRating">
              Rating: {renderRatingStars(review.rating)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reviews;