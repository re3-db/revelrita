const star = "M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.4 6 20.6l1.3-6.8-5-4.7 6.8-.8z";

/** Five orange stars, shown above every review. */
export default function Stars() {
  return (
    <div className="stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={star} />
        </svg>
      ))}
    </div>
  );
}
