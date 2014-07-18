class MyCardController < ApplicationController
  unloadable

  before_filter :require_login

  def my_index

    @apiKey = User.current.api_key

    @trackers = Tracker.all
    @statuses = IssueStatus.all

    render 'index'
  end



end
