/* eslint-disable */

const React = require('react');
const ReactPaginate = require('react-paginate');
const FormResponsesTable = require('./formResponsesTable.jsx');
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
      currentPage: 1,
      totalCount: 0,
      pageCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      unprocessedCount: 0,
      isPrinting: false
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

  printResponses() {
    this.setState({ isPrinting: true }, () => {
      window.print();
      setTimeout(() => this.setState({ isPrinting: false }), 0);
    });
  }

  onStoreChange() {
    this.setState({
      responses: responsesStore.getResponses(this.state.currentPage),
      totalCount: responsesStore.getTotalCount(),
      pageCount: responsesStore.getPageCount(),
      approvedCount: responsesStore.getApprovedCount(),
      rejectedCount: responsesStore.getRejectedCount(),
      unprocessedCount: responsesStore.getUnprocessedCount(),
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
        <button className="printButton no-print" onClick={() => this.printResponses()}>Print</button>
        <div className="stats no-print">
          <h2>Affiliate Signup Responses ({this.state.totalCount})</h2>
          <span>
            <h1>{this.state.unprocessedCount}</h1>
            <h3>Unprocessed responses</h3>
          </span>
          <span>
            <h1>{this.state.approvedCount}</h1>
            <h3>Approved responses</h3>
          </span>
          <span>
            <h1>{this.state.rejectedCount}</h1>
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
        <FormResponsesTable isPrinting={this.state.isPrinting} responses={filteredResponses} />
        <div className='pagination no-print'>
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
