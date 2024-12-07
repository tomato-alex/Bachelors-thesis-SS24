# Questionnaire

## Questions

::slider 1 10 1 "How satisfied are you with this presentation?"

::stars 5 "How would you rate this service?"

::radio "What is your favourite fruit?"
() Apple
() Banana
() Orange

::checkbox "Whats your favourite subject?"
[] FDA
[] SE2
[] PR1

::dropdown "How do you prefer to be contacted?"
() Phone
() Email
() None

::dropdown "Which lingos do you speak?"
[] English
[] Spanish
[] German

?:scale-rating q:"How satisfied are you with the quick mockup?"
::min 1
::max 5

?:checkbox-single q:"What is your favorite fruit?"
::Apple
::Banana
::Orange

?:checkbox-multi q:"Which activities do you enjoy?"
::Hiking
::Reading
::Cooking

?:text-input q:"Please describe your experience."
::placeholder Your answer here...

?:dropdown-single q:"What is your preferred contact method?"
::Email
::Phone
::SMS

?:dropdown-multi q:"Which countries have you visited?"
::USA
::Canada
::Germany
::Japan
