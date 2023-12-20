<!-- Future Improvement or Ideas -->

**Home work - Contact form page with mailsender**

<h3> Improve Avg Rating Function</h3>
<p style="font-size:18px">
Doing aggregation in each course for multiple course for each page will be much slower (number more to calc rating) 
So alternative approach can be that We can include "avgRating" field in the CourseSchema and whenever someone getAllCourse or getCourseDetails we can directly give the avgRating without computing
, resulting in low latency in load time on the important page.
To calculate the avgRating we can increase the process when the enrolled user rates the course simply ratingSchema will work as usual but during the time of rating we can do some math to calculate the current rating count for course and also sum of all the rating 
thus calculate the avg rating which I can update in avgRating to make it easily accessible : Remember when there is no Rating the default will be zero for avgRating.
</p>

<h3> Handle course, section and subsection</h3>
<p style="font-size:18px">
When updating one field, think how it affects child or parent schema as course is tighly connected. Handle how you handle the deletion of subsection(video) or course and how will you delete the media on the cloudinary.
</p>
<br>
<p style="font-size:18px">
 It's important to complement auth middleware with proper input validation (as mentioned in the previous response) to safeguard against any potential malicious attempts to tamper with the request body. Always validate and sanitize user inputs before processing them.
</p>

<h3> Implement course progress function</h3>
<p style="font-size:18px">
Think of a way to keep the count of total subsection/video in the course, and whenever student completes one subsection make sure to hit the db and mark in courseProgress in User Schema. Also find a way to handle which subsection is completed and which section is fully complete to make better UI/UX.
</p>
<br>

<h3> Implement authenticated access of cloudinary response url</h3>
<p style="font-size:18px">
Think of a way to make sure that only the enrolled student in a course can access that course url content.
</p>
<br>
