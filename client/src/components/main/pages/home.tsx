import styled from "@emotion/styled";

const CenteredText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centers content horizontally */
  align-items: center; /* Centers content vertically */
  height: 500px;
  width: 100%;
  font-size: 25px;
  font-weight: bold;
`;
export const HomePage = () => {
  return (
    <CenteredText>
      <div>Welcome to the Triangle squares application</div>
      <div>With this application you can:</div>

      <ul>
        <li>
          Track square dancing events for a particular day, class, and caller.
          Events can be created in bulk.
        </li>
        <li>Track how much should be paid for all of your callers.</li>
        <li>
          Track the different dance classes that you have.(ie. mainstream, plus,
          advanced, and challenge. )
        </li>
        <li>
          Track the students that have registered for each class. Students can
          be imported from a google form. Student data can also be exported to a
          mailchimp csv text.
        </li>
      </ul>
    </CenteredText>
  );
};
