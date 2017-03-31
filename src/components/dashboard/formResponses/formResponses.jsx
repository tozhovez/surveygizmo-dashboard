/* eslint-disable */

const React = require('react');
const ReactPaginate = require('react-paginate');
const FormResponse = require('./formResponse/formResponse.jsx');
const FormResponseDetails = require('./formResponseDetails/formResponseDetails.jsx');
const ApproveModal = require('../modals/approveModal/approveModal.jsx');
const RejectModal = require('../modals/rejectModal/rejectModal.jsx');
const responsesStore = require('../../../stores/responses');
const responseActions = require('../../../actions/response');

class FormResponses extends React.PureComponent {
  constructor() {
    super();

    this.onStoreChange = this.onStoreChange.bind(this);
    this.viewResponse = this.viewResponse.bind(this);
    this.showApproveModal = this.showApproveModal.bind(this);
    this.showRejectModal = this.showRejectModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.search = this.search.bind(this);
    this.filter = this.filter.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);

    this.state = {
      search: '',
      filter: '',
      responses: [],
      approveResponse: null,
      rejectResponse: null,
      currentPage: 1
    };
  }

  handlePageClick(data) {
    const pageIndex = data.selected + 1;
    this.setState({currentPage: pageIndex});
    responseActions.loadResponses(pageIndex);
  }

  viewResponse(viewResponse) {
    this.setState({ viewResponse });
  }

  showApproveModal(approveResponse) {
    this.setState({ approveResponse });
  }

  showRejectModal(rejectResponse) {
    this.setState({ rejectResponse });
  }

  closeModal() {
    this.setState({
      rejectResponse: null,
      approveResponse: null
    });
  }

  search(event) {
    this.setState({ search: event.target.value });
  }

  filter(event) {
    this.setState({ filter: event.target.value });
  }

  onStoreChange() {
    console.log('change store');
    this.setState({
      responses: responsesStore.getResponses(this.state.currentPage),
      pageCount: responsesStore.getTotalCount()
    });
  }

  componentDidMount() {
    responsesStore.addChangeListener(this.onStoreChange);
    responseActions.loadResponses(this.state.currentPage);
  }

  componentWillUnmount() {
    responsesStore.removeChangeListener(this.onStoreChange);
  }

  render() {
    const { responses, viewResponse, approveResponse, rejectResponse, search, filter } = this.state;
    let filteredResponses = [];

    if (search) {
      filteredResponses = responses.filter(r =>
        r.questions &&
        (
          (r.questions['Full name'].toLowerCase()).indexOf(search.toLowerCase()) >= 0 ||
          (r.questions['Submitter Email'].toLowerCase()).indexOf(search.toLowerCase()) >= 0 ||
          (r.questions['Organization'].toLowerCase()).indexOf(search.toLowerCase()) >= 0
        )
      );
    }
    else {
      filteredResponses = responses;
    }

    if (filter === 'pending') {
      filteredResponses = filteredResponses.filter(r => !r.status);
    }
    else if (filter) {
      filteredResponses = filteredResponses.filter(r => r.status && r.status[filter]);
    }

    return (
      <div>
        <div className="stats">
          <h2>Affiliate Signup Responses ({responses.length})</h2>
          <span>
            <h1>{responses.filter(r => !r.status).length}</h1>
            <h3>Unprocessed responses</h3>
          </span>
          <span>
            <h1>{responses.filter(r => r.status && r.status.sentPasswordReset).length}</h1>
            <h3>Approved responses</h3>
          </span>
          <span>
            <h1>{responses.filter(r => r.status && r.status.rejected).length}</h1>
            <h3>Rejected responses</h3>
          </span>
          <div>
            <input type="search" onChange={this.search} placeholder="Search" />
            <select onChange={this.filter} autoComplete="off" defaultValue="">
              <option value="">Filter By Status</option>
              <option value="pending">Pending</option>
              <option value="sentPasswordReset">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <b style={{ textAlign: 'left' }}>{filteredResponses.length} results</b>
          </div>
        </div>
        <table className="form-responses">
          <thead>
            <tr>
              <td>Name</td>
              <td>Email</td>
              <td>Company Name</td>
              <td>Submitted at</td>
              <td>Status</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {
              filteredResponses.map(response =>
                <FormResponse
                  key={`form-response-${response.id}`}
                  response={response}
                  viewResponse={this.viewResponse}
                />
              )
            }
          </tbody>
        </table>
        <div className='pagination'>
          <ReactPaginate
            pageCount={this.state.pageCount}
            onPageChange={this.handlePageClick}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
          />
        </div>

        <FormResponseDetails
          showApproveModal={this.showApproveModal}
          showRejectModal={this.showRejectModal}
        />

        <ApproveModal response={approveResponse} close={this.closeModal} />
        <RejectModal response={rejectResponse} close={this.closeModal} />
      </div>
    );
  }
};

module.exports = FormResponses;
